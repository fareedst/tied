/**
 * [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  validateStressorResidueRecord,
  validateStressorResidueRecordObject,
} from "./stressor-residue-validate.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const PILOT_RECORD = path.join(
  REPO_ROOT,
  "working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/records/S-T01.yaml",
);

function validMinimalRecord(): Record<string, unknown> {
  return {
    schema_version: "stressor-residue.v1",
    baseline: {
      objective: "Pilot objective",
      naive_architecture_summary: "See baseline.md",
    },
    stressor: {
      id: "S-T99",
      category: "technical",
      description: "Example stressor",
    },
    impact_path: {
      functions: ["worker"],
    },
    residue: {
      description: "Remainder property",
      class: "desirable",
    },
    evidence: {
      proof_boundary: "Discovery aid only",
    },
    disposition: {
      status: "unresolved",
      tied_refs: ["REQ-FEAT_TASK_EXECUTION_RECOVERY"],
    },
  };
}

describe("stressor-residue.v1 validator [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION]", () => {
  it("accepts pilot S-T01 record via yaml_text", () => {
    const yamlText = fs.readFileSync(PILOT_RECORD, "utf8");
    const result = validateStressorResidueRecord({ yaml_text: yamlText });
    assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
    assert.equal(result.proof_boundary.includes("Discovery"), true);
  });

  it("accepts minimal valid object", () => {
    const result = validateStressorResidueRecordObject(validMinimalRecord());
    assert.equal(result.ok, true);
  });

  it("rejects wrong schema_version", () => {
    const record = validMinimalRecord();
    record.schema_version = "stressor-residue.v0";
    const result = validateStressorResidueRecordObject(record);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === "WRONG_SCHEMA_VERSION"));
  });

  it("rejects missing proof_boundary", () => {
    const record = validMinimalRecord();
    (record.evidence as Record<string, unknown>).proof_boundary = "";
    const result = validateStressorResidueRecordObject(record);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.path === "evidence.proof_boundary"));
  });

  it("rejects invalid tied_refs token", () => {
    const record = validMinimalRecord();
    (record.disposition as Record<string, unknown>).tied_refs = ["NOT-A-TOKEN"];
    const result = validateStressorResidueRecordObject(record);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === "INVALID_TIED_REF"));
  });

  it("requires exactly one input mode", () => {
    const result = validateStressorResidueRecord({});
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.path === "$input"));
  });
});
