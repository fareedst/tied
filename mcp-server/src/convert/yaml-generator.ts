/**
 * Build YAML index records from parsed monolithic sections.
 * Maps to TIED v1.5.0+ (REQ/ARCH) and v2.2.0 (IMPL) schema.
 * [IMPL] IMPL detail YAML uses canonical data object from implementation-decisions.template.md (TIED v2.2.0).
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
  "traceability", "related_decisions", "detail_file", "metadata", "token_coverage", "validation_evidence", "decision",
]);
/** TIED v2.2.0 IMPL canonical + optional/extra keys so mergeFieldsIntoRecord does not overwrite. */
const IMPLEMENTATION_TOP_KEYS = new Set([
  "name", "status", "cross_references", "rationale", "implementation_approach", "code_locations",
  "traceability", "related_decisions", "detail_file", "metadata",
  "token_coverage", "code_markers", "validation_evidence",
  "essence_pseudocode", "location", "result_type_fields", "result_type_fields_structured",
  "item_error_fields", "item_error_fields_structured", "population", "availability",
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

/** Convert a field value (string or string[]) to an array of non-empty strings (e.g. bullet lines). */
function fieldToLines(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  const s = String(value).trim();
  if (!s) return [];
  const lines = s.split(/\n/).map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  return lines.length > 0 ? lines : [s];
}

/** Extract REQ-*, ARCH-*, IMPL-* tokens from text (without brackets). Returns unique list. */
function extractTokensFromText(text: string | string[] | undefined): string[] {
  if (text == null) return [];
  const str = Array.isArray(text) ? text.join(" ") : String(text);
  const re = /\[(REQ-[A-Z0-9_]+|ARCH-[A-Z0-9_]+|IMPL-[A-Z0-9_]+)\]/g;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(str)) !== null) seen.add(m[1]);
  return [...seen];
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

/** Implementation-approach subsection keys (normalized) to include in details[]. */
const ARCH_IMPL_APPROACH_SUBSECTION_KEYS = [
  "high_level_strategy", "key_components", "data_flow_diagram", "filtering_rules", "frequency_ranking",
  "case_preservation", "sanitization", "deduplication_vs_current_tags", "display", "numeric_limits",
  "url_path_filtering", "noise_word_list", "title_attribute_priority", "case_preservation_rules",
  "deduplication_strategy", "module_identification_requirements", "validation_approach",
  "integration_requirements", "extraction_sources", "tokenization", "key_modifiable_decisions",
];

function fieldString(
  fields: Record<string, string | string[]> | undefined,
  key: string
): string | undefined {
  if (!fields || !(key in fields)) return undefined;
  const v = fields[key];
  if (v == null) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  return Array.isArray(v) && v.length > 0 ? v.join("\n").trim() || undefined : undefined;
}

/**
 * Build a single architecture-decisions.yaml record from a parsed section.
 * [IMPL] Full transform: rationale (why, problems_solved, benefits), implementation_approach (summary, details, key_components, integration_points), related_decisions (depends_on, informs, see_also), decision, validation_evidence.
 */
export function architectureToYamlRecord(
  parsed: ParsedArchitectureDecision,
  detailFile: string
): Record<string, unknown> {
  const fields = parsed.fields;
  const status =
    parsed.status != null && parsed.status.trim() !== ""
      ? parsed.status.toLowerCase().includes("implemented")
        ? "Implemented"
        : parsed.status.toLowerCase().includes("deprecated")
          ? "Deprecated"
          : "Active"
      : "Active";

  const why =
    fieldString(fields, "why") ??
    fieldString(fields, "why_this_architecture") ??
    parsed.rationale ??
    parsed.decision ??
    "See detail file";
  const problemsSolved = fieldToLines(fields?.problems_solved);
  const benefits = fieldToLines(fields?.benefits);

  const implSummary =
    parsed.implementation_approach ??
    fieldString(fields, "summary") ??
    parsed.decision ??
    "See detail file";
  const details: string[] = [];
  for (const key of ARCH_IMPL_APPROACH_SUBSECTION_KEYS) {
    const val = fieldString(fields, key);
    if (val) details.push(val);
  }
  const implementation_approach: Record<string, unknown> = {
    summary: implSummary,
    details,
  };
  const keyComponents = fields?.key_components;
  if (keyComponents !== undefined && keyComponents !== "" && (typeof keyComponents !== "object" || (Array.isArray(keyComponents) && keyComponents.length > 0))) {
    implementation_approach.key_components = keyComponents;
  }
  const integrationPoints = fields?.integration_points;
  if (integrationPoints !== undefined && integrationPoints !== "" && (typeof integrationPoints !== "object" || (Array.isArray(integrationPoints) && integrationPoints.length > 0))) {
    implementation_approach.integration_points = integrationPoints;
  }

  const dependsOn = extractTokensFromText(fields?.depends_on);
  const informs = extractTokensFromText(fields?.informs);
  const seeAlso = extractTokensFromText(fields?.see_also);
  const related_decisions = {
    depends_on: dependsOn.length > 0 ? dependsOn : parsed.req_refs,
    informs,
    see_also: seeAlso,
  };

  const decision =
    parsed.decision ??
    fieldString(fields, "decision") ??
    fieldString(fields, "summary");

  const record: Record<string, unknown> = {
    name: parsed.title,
    status,
    cross_references: parsed.req_refs,
    rationale: {
      why,
      problems_solved: problemsSolved,
      benefits,
    },
    alternatives_considered: parsed.alternatives_considered
      ? [{ name: "See detail file", pros: [], cons: [], rejected_reason: parsed.alternatives_considered }]
      : [],
    implementation_approach,
    traceability: {
      requirements: parsed.req_refs,
      implementation: [],
      tests: [],
      code_annotations: [parsed.token, ...parsed.req_refs],
    },
    related_decisions,
    detail_file: detailFile,
    metadata: {
      created: { date: today(), author: "MCP converter" },
      last_updated: { date: today(), author: "MCP converter", reason: "Converted from monolithic" },
      last_validated: { date: today(), validator: "MCP converter", result: "pass" },
    },
  };
  if (decision) record.decision = decision;
  if (parsed.token_coverage != null && parsed.token_coverage.trim() !== "") {
    record.token_coverage = parsed.token_coverage;
  }
  const validationEvidence = fields?.validation_evidence;
  if (validationEvidence !== undefined && validationEvidence !== "" && (typeof validationEvidence !== "object" || (Array.isArray(validationEvidence) && validationEvidence.length > 0))) {
    record.validation_evidence = validationEvidence;
  }
  mergeFieldsIntoRecord(record, parsed.fields, ARCHITECTURE_TOP_KEYS);
  return record;
}

/** Subsection keys from parsed.fields to fold into implementation_approach.details[]. */
const IMPL_APPROACH_DETAIL_KEYS = [
  "high_level_strategy", "key_components", "implementation_details", "location", "result_type_fields",
  "item_error_fields", "population", "availability", "data_flow", "key_algorithms",
];

/**
 * Build a single implementation-decisions.yaml record from a parsed section.
 * TIED v2.2.0 canonical data object: implementation_approach only summary+details;
 * code_locations as file/function objects; status Active|Deprecated|Template|Superseded;
 * STDD/extra keys (location, result_type_fields, etc.) at root.
 */
export function implementationToYamlRecord(
  parsed: ParsedImplementationDecision,
  detailFile: string
): Record<string, unknown> {
  const rawStatus = parsed.status?.trim() ?? "";
  const lower = rawStatus.toLowerCase();
  const status =
    lower.includes("superseded") ? "Superseded"
    : lower.includes("deprecated") ? "Deprecated"
    : lower.includes("template") ? "Template"
    : rawStatus !== "" ? "Active"
    : "Active";

  const summary = parsed.implementation_approach || parsed.decision || "See detail file";
  const details: string[] = [];
  if (parsed.implementation_details?.trim()) {
    const lines = fieldToLines(parsed.implementation_details);
    if (lines.length > 0) details.push(...lines);
    else details.push(parsed.implementation_details.trim());
  }
  const fields = parsed.fields;
  for (const key of IMPL_APPROACH_DETAIL_KEYS) {
    const val = fieldString(fields, key);
    if (val && !details.includes(val)) details.push(val);
  }

  const implementation_approach: Record<string, unknown> = {
    summary,
    details,
  };

  const codeLocationsFiles: Array<{ path: string; description?: string; lines?: number[] }> = [];
  if (parsed.location != null && parsed.location !== "") {
    codeLocationsFiles.push({ path: parsed.location });
  }

  const record: Record<string, unknown> = {
    name: parsed.title,
    status,
    cross_references: [...parsed.arch_refs, ...parsed.req_refs],
    rationale: {
      why: parsed.rationale || parsed.decision || parsed.implementation_approach || "See detail file",
      problems_solved: fieldToLines(fields?.problems_solved),
      benefits: fieldToLines(fields?.benefits),
    },
    implementation_approach,
    code_locations: {
      files: codeLocationsFiles,
      functions: [] as Array<{ name: string; file: string; description?: string }>,
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
      composed_with: (extractTokensFromText(fields?.composed_with)).filter((t) => t.startsWith("IMPL-")),
    },
    detail_file: detailFile,
    metadata: {
      created: { date: today(), author: "MCP converter" },
      last_updated: { date: today(), author: "MCP converter", reason: "Converted from monolithic" },
      last_validated: { date: today(), validator: "MCP converter", result: "pass" },
    },
  };

  if (fieldString(fields, "essence_pseudocode")) {
    record.essence_pseudocode = fieldString(fields, "essence_pseudocode");
  }

  if (parsed.location != null && parsed.location !== "") {
    record.location = parsed.location;
  }
  if (parsed.result_type_fields_structured != null && parsed.result_type_fields_structured.length > 0) {
    record.result_type_fields = parsed.result_type_fields_structured;
  } else if (parsed.result_type_fields != null && parsed.result_type_fields !== "") {
    record.result_type_fields = parsed.result_type_fields;
  }
  if (parsed.item_error_fields_structured != null && parsed.item_error_fields_structured.length > 0) {
    record.item_error_fields = parsed.item_error_fields_structured;
  } else if (parsed.item_error_fields != null && parsed.item_error_fields !== "") {
    record.item_error_fields = parsed.item_error_fields;
  }
  if (parsed.population != null && parsed.population !== "") {
    record.population = parsed.population;
  }
  if (parsed.availability != null && parsed.availability !== "") {
    record.availability = parsed.availability;
  }
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
