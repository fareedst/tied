/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * validation-cases.v1 — Stage 7 comprehension task bank (portable validation-cases.yaml map).
 */

import yaml from "js-yaml";

export const VALIDATION_CASES_V1_SCHEMA = "validation-cases.v1";

export const VALIDATION_GRADERS = [
  "receipt_field",
  "test_file_assertion",
  "mcp_tool_registry",
  "symbol_ref",
  "source_graph_trace",
  "engagement_facet",
] as const;

export type ValidationGrader = (typeof VALIDATION_GRADERS)[number];

export type ValidationCaseV1 = {
  task_id: string;
  prompt: string;
  grader: ValidationGrader;
  inputs: Record<string, unknown>;
  expected: Record<string, unknown>;
  references?: string[];
};

export type ValidationCasesDocumentV1 = {
  schema_version: typeof VALIDATION_CASES_V1_SCHEMA;
  request_token: string;
  git_rev?: string;
  cases: ValidationCaseV1[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGrader(value: unknown): value is ValidationGrader {
  return typeof value === "string" && (VALIDATION_GRADERS as readonly string[]).includes(value);
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — BUILD_VALIDATION_CASES_V1
export function validateValidationCasesDocument(
  doc: unknown,
  options?: { min_cases?: number },
): { ok: true; document: ValidationCasesDocumentV1 } | { ok: false; error: string } {
  if (!isRecord(doc)) {
    return { ok: false, error: "schema_mismatch" };
  }
  if (doc.schema_version !== VALIDATION_CASES_V1_SCHEMA) {
    return { ok: false, error: "schema_mismatch" };
  }
  if (typeof doc.request_token !== "string" || !doc.request_token.trim()) {
    return { ok: false, error: "missing_request_token" };
  }
  if (!Array.isArray(doc.cases)) {
    return { ok: false, error: "missing_cases" };
  }
  const minCases = options?.min_cases ?? 1;
  if (doc.cases.length < minCases) {
    return { ok: false, error: "insufficient_cases" };
  }
  const seen = new Set<string>();
  const cases: ValidationCaseV1[] = [];
  for (const raw of doc.cases) {
    if (!isRecord(raw)) {
      return { ok: false, error: "invalid_case" };
    }
    const task_id = typeof raw.task_id === "string" ? raw.task_id.trim() : "";
    const prompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
    if (!task_id || !prompt) {
      return { ok: false, error: "invalid_case" };
    }
    if (seen.has(task_id)) {
      return { ok: false, error: "duplicate_task_id" };
    }
    seen.add(task_id);
    if (!isGrader(raw.grader)) {
      return { ok: false, error: "invalid_grader" };
    }
    if (!isRecord(raw.inputs) || !isRecord(raw.expected)) {
      return { ok: false, error: "invalid_case" };
    }
    cases.push({
      task_id,
      prompt,
      grader: raw.grader,
      inputs: raw.inputs,
      expected: raw.expected,
      references: Array.isArray(raw.references)
        ? raw.references.filter((r): r is string => typeof r === "string")
        : undefined,
    });
  }
  return {
    ok: true,
    document: {
      schema_version: VALIDATION_CASES_V1_SCHEMA,
      request_token: doc.request_token.trim(),
      git_rev: typeof doc.git_rev === "string" ? doc.git_rev : undefined,
      cases,
    },
  };
}

export function parseValidationCasesYaml(
  yamlText: string,
  options?: { min_cases?: number },
): ReturnType<typeof validateValidationCasesDocument> {
  const parsed = yaml.load(yamlText);
  return validateValidationCasesDocument(parsed, options);
}
