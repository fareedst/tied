/**
 * Build YAML index records from parsed monolithic sections.
 * Maps to TIED v1.5.0+ schema (requirements, architecture-decisions, implementation-decisions).
 * [IMPL] Every heading or label that holds text or a list is emitted as a key via parsed.fields.
 */

import type {
  ParsedRequirement,
  ParsedArchitectureDecision,
  ParsedImplementationDecision,
} from "./parser.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Known top-level keys already set by the TIED schema; keys from fields not in this set are added as-is. */
const REQUIREMENT_TOP_KEYS = new Set([
  "name", "category", "priority", "status", "rationale", "satisfaction_criteria", "validation_criteria",
  "traceability", "related_requirements", "detail_file", "metadata", "implementation_notes",
]);
const ARCHITECTURE_TOP_KEYS = new Set([
  "name", "status", "cross_references", "rationale", "alternatives_considered", "implementation_approach",
  "traceability", "related_decisions", "detail_file", "metadata", "token_coverage",
]);
const IMPLEMENTATION_TOP_KEYS = new Set([
  "name", "status", "cross_references", "rationale", "implementation_approach", "code_locations",
  "traceability", "related_decisions", "detail_file", "metadata", "token_coverage", "code_markers", "validation_evidence",
]);

/**
 * Merge parsed.fields into record: add each key not already in knownKeys as top-level.
 * Values are string or string[] (lists become YAML arrays).
 */
function mergeFieldsIntoRecord(
  record: Record<string, unknown>,
  fields: Record<string, string | string[]> | undefined,
  knownKeys: Set<string>
): void {
  if (!fields || Object.keys(fields).length === 0) return;
  const extraKeys = Object.keys(fields).filter((k) => !knownKeys.has(k));
  extraKeys.sort();
  for (const k of extraKeys) {
    const v = fields[k];
    if (v !== undefined && v !== "" && (typeof v !== "object" || (Array.isArray(v) && v.length > 0)))
      record[k] = v;
  }
}

function parseCriteriaLines(text: string): Array<{ criterion: string; metric?: string }> {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\n/).map((s) => s.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  return lines.map((c) => ({ criterion: c, metric: undefined }));
}

function parseValidationLines(text: string): Array<{ method: string; coverage?: string }> {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\n/).map((s) => s.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  return lines.map((m) => ({ method: m, coverage: undefined }));
}

/**
 * Build a single requirements.yaml record from a parsed requirement section.
 */
export function requirementToYamlRecord(
  parsed: ParsedRequirement,
  detailFile: string
): Record<string, unknown> {
  const arch = parsed.traceability_arch ?? [];
  const impl = parsed.traceability_impl ?? [];
  const satisfaction = parsed.satisfaction_criteria
    ? parseCriteriaLines(parsed.satisfaction_criteria)
    : [{ criterion: "See detail file" }];
  const validation = parsed.validation_criteria
    ? parseValidationLines(parsed.validation_criteria)
    : [{ method: "Manual verification", coverage: "See detail file" }];
  const priority = (parsed.priority || "P1").replace(/^P(\d).*/, "P$1");
  const status =
    parsed.status?.includes("Implemented") || parsed.status?.includes("✅")
      ? "Implemented"
      : "Planned";
  const category = parsed.category || "Functional";
  const record: Record<string, unknown> = {
    name: parsed.title,
    category,
    priority,
    status,
    rationale: {
      why: parsed.rationale || parsed.description || "See detail file",
      problems_solved: [],
      benefits: [],
    },
    satisfaction_criteria: satisfaction,
    validation_criteria: validation,
    traceability: {
      architecture: arch,
      implementation: impl,
      tests: [],
      code_annotations: [parsed.token],
    },
    related_requirements: {
      depends_on: parsed.related_depends_on ?? [],
      related_to: [],
      supersedes: [],
    },
    detail_file: detailFile,
    metadata: {
      created: { date: today(), author: "MCP converter" },
      last_updated: { date: today(), author: "MCP converter", reason: "Converted from monolithic" },
      last_validated: { date: today(), validator: "MCP converter", result: "pass" },
    },
  };
  if (parsed.implementation_notes != null && parsed.implementation_notes.trim() !== "") {
    record.implementation_notes = parsed.implementation_notes;
  }
  mergeFieldsIntoRecord(record, parsed.fields, REQUIREMENT_TOP_KEYS);
  return record;
}

/**
 * Build a single architecture-decisions.yaml record from a parsed section.
 */
export function architectureToYamlRecord(
  parsed: ParsedArchitectureDecision,
  detailFile: string
): Record<string, unknown> {
  const status =
    parsed.status != null && parsed.status.trim() !== ""
      ? parsed.status.toLowerCase().includes("implemented")
        ? "Implemented"
        : parsed.status.toLowerCase().includes("deprecated")
          ? "Deprecated"
          : "Active"
      : "Active";
  const record: Record<string, unknown> = {
    name: parsed.title,
    status,
    cross_references: parsed.req_refs,
    rationale: {
      why: parsed.rationale || parsed.decision || "See detail file",
      problems_solved: [],
      benefits: [],
    },
    alternatives_considered: parsed.alternatives_considered
      ? [{ name: "See detail file", pros: [], cons: [], rejected_reason: parsed.alternatives_considered }]
      : [],
    implementation_approach: {
      summary: parsed.implementation_approach || parsed.decision || "See detail file",
      details: [],
    },
    traceability: {
      requirements: parsed.req_refs,
      implementation: [],
      tests: [],
      code_annotations: [parsed.token, ...parsed.req_refs],
    },
    related_decisions: {
      depends_on: parsed.req_refs,
      informs: [],
      see_also: [],
    },
    detail_file: detailFile,
    metadata: {
      created: { date: today(), author: "MCP converter" },
      last_updated: { date: today(), author: "MCP converter", reason: "Converted from monolithic" },
      last_validated: { date: today(), validator: "MCP converter", result: "pass" },
    },
  };
  if (parsed.token_coverage != null && parsed.token_coverage.trim() !== "") {
    record.token_coverage = parsed.token_coverage;
  }
  mergeFieldsIntoRecord(record, parsed.fields, ARCHITECTURE_TOP_KEYS);
  return record;
}

/**
 * Build a single implementation-decisions.yaml record from a parsed section.
 * [IMPL] Captures Location, Result Type Fields, ItemError Fields, Population, Availability as data keys for STDD.
 */
export function implementationToYamlRecord(
  parsed: ParsedImplementationDecision,
  detailFile: string
): Record<string, unknown> {
  const status =
    parsed.status != null && parsed.status.trim() !== ""
      ? parsed.status.toLowerCase().includes("implemented")
        ? "Implemented"
        : parsed.status.toLowerCase().includes("deprecated")
          ? "Deprecated"
          : "Active"
      : "Active";
  const implApproach: Record<string, unknown> = {
    summary: parsed.implementation_approach || parsed.decision || "See detail file",
    details: parsed.implementation_details ? [parsed.implementation_details] : [],
  };
  if (parsed.location != null && parsed.location !== "")
    implApproach.location = parsed.location;
  if (parsed.result_type_fields_structured != null && parsed.result_type_fields_structured.length > 0)
    implApproach.result_type_fields = parsed.result_type_fields_structured;
  else if (parsed.result_type_fields != null && parsed.result_type_fields !== "")
    implApproach.result_type_fields = parsed.result_type_fields;
  if (parsed.item_error_fields_structured != null && parsed.item_error_fields_structured.length > 0)
    implApproach.item_error_fields = parsed.item_error_fields_structured;
  else if (parsed.item_error_fields != null && parsed.item_error_fields !== "")
    implApproach.item_error_fields = parsed.item_error_fields;
  if (parsed.population != null && parsed.population !== "")
    implApproach.population = parsed.population;
  if (parsed.availability != null && parsed.availability !== "")
    implApproach.availability = parsed.availability;
  const record: Record<string, unknown> = {
    name: parsed.title,
    status,
    cross_references: [...parsed.arch_refs, ...parsed.req_refs],
    rationale: {
      why: parsed.rationale || parsed.decision || parsed.implementation_approach || "See detail file",
      problems_solved: [],
      benefits: [],
    },
    implementation_approach: implApproach,
    code_locations: {
      files:
        parsed.location != null && parsed.location !== ""
          ? [parsed.location]
          : [],
      functions: [],
    },
    traceability: {
      architecture: parsed.arch_refs,
      requirements: parsed.req_refs,
      tests: [],
      code_annotations: [parsed.token, ...parsed.arch_refs, ...parsed.req_refs],
    },
    related_decisions: {
      depends_on: [],
      supersedes: [],
      see_also: [...parsed.arch_refs, ...parsed.req_refs],
    },
    detail_file: detailFile,
    metadata: {
      created: { date: today(), author: "MCP converter" },
      last_updated: { date: today(), author: "MCP converter", reason: "Converted from monolithic" },
      last_validated: { date: today(), validator: "MCP converter", result: "pass" },
    },
  };
  if (parsed.token_coverage != null && parsed.token_coverage.trim() !== "") {
    record.token_coverage = parsed.token_coverage;
  }
  if (parsed.code_markers != null && parsed.code_markers.trim() !== "") {
    record.code_markers = parsed.code_markers;
  }
  if (parsed.validation_evidence != null && parsed.validation_evidence.trim() !== "") {
    record.validation_evidence = parsed.validation_evidence;
  }
  mergeFieldsIntoRecord(record, parsed.fields, IMPLEMENTATION_TOP_KEYS);
  return record;
}
