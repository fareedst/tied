/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * validation-results.v1 — Stage 7 grader outcomes (portable validation-results.json).
 */

import { createHash } from "node:crypto";

import type { ValidationGrader } from "./validation-cases-v1.js";

export const VALIDATION_RESULTS_V1_SCHEMA = "validation-results.v1";

export type ValidationTaskResultV1 = {
  task_id: string;
  grader: ValidationGrader;
  pass: boolean;
  detail?: string;
  evidence_ref?: string;
};

export type ValidationResultsV1 = {
  schema_version: typeof VALIDATION_RESULTS_V1_SCHEMA;
  request_token: string;
  git_rev: string;
  cases_path: string;
  evidence_refs: string[];
  tasks: ValidationTaskResultV1[];
  pass_count: number;
  fail_count: number;
  content_hash: string;
};

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — RUN_EASAR_VALIDATION_SUITE_V1 POST
export function buildValidationResultsV1(input: {
  request_token: string;
  git_rev: string;
  cases_path: string;
  evidence_refs: string[];
  tasks: ValidationTaskResultV1[];
}): ValidationResultsV1 {
  const pass_count = input.tasks.filter((t) => t.pass).length;
  const fail_count = input.tasks.length - pass_count;
  const body: Omit<ValidationResultsV1, "content_hash"> = {
    schema_version: VALIDATION_RESULTS_V1_SCHEMA,
    request_token: input.request_token,
    git_rev: input.git_rev,
    cases_path: input.cases_path,
    evidence_refs: input.evidence_refs.slice().sort(),
    tasks: input.tasks.slice(),
    pass_count,
    fail_count,
  };
  return {
    ...body,
    content_hash: stableHash(body),
  };
}
