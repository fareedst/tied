import fs from "node:fs";

import yaml from "js-yaml";

import { isRecord } from "./dae/yaml-load.js";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1c additive handoff-shaped phase YAML schema v1 validate. */

const VERIFIED_BY = new Set(["command", "mcp_tool", "manual"]);

export type HandoffValidationResult = {
  ok: boolean;
  exit_code: 0 | 1;
  diagnostics: string[];
};

function validateCriterion(criterion: unknown, index: number): string[] {
  const diagnostics: string[] = [];
  if (!isRecord(criterion)) {
    diagnostics.push(`criteria[${index}]:not_object`);
    return diagnostics;
  }
  if (typeof criterion.id !== "string" || !criterion.id.trim()) {
    diagnostics.push(`criteria[${index}]:missing_id`);
  }
  if (typeof criterion.description !== "string" || !criterion.description.trim()) {
    diagnostics.push(`criteria[${index}]:missing_description`);
  }
  const verifiedBy = criterion.verified_by;
  if (typeof verifiedBy !== "string" || !VERIFIED_BY.has(verifiedBy)) {
    diagnostics.push(`criteria[${index}]:missing_or_invalid_verified_by`);
  }
  if (!isRecord(criterion.evidence)) {
    diagnostics.push(`criteria[${index}]:missing_evidence_object`);
  }
  return diagnostics;
}

export function validateHandoffDocument(doc: unknown): HandoffValidationResult {
  const diagnostics: string[] = [];
  if (!isRecord(doc)) {
    return { ok: false, exit_code: 1, diagnostics: ["root:not_object"] };
  }
  if (doc.schema_version !== 1) {
    diagnostics.push("schema_version:must_be_1");
  }
  if (typeof doc.request_token !== "string" || !doc.request_token.trim()) {
    diagnostics.push("request_token:required");
  }
  if (typeof doc.phase !== "string" || !doc.phase.trim()) {
    diagnostics.push("phase:required");
  }
  if (!Array.isArray(doc.criteria) || doc.criteria.length === 0) {
    diagnostics.push("criteria:required_non_empty_array");
  } else {
    doc.criteria.forEach((c, i) => {
      diagnostics.push(...validateCriterion(c, i));
    });
  }
  const ok = diagnostics.length === 0;
  return { ok, exit_code: ok ? 0 : 1, diagnostics };
}

export function validateHandoffYamlFile(absolutePath: string): HandoffValidationResult {
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, exit_code: 1, diagnostics: [`missing_file:${absolutePath}`] };
  }
  const raw = yaml.load(fs.readFileSync(absolutePath, "utf8"));
  return validateHandoffDocument(raw);
}
