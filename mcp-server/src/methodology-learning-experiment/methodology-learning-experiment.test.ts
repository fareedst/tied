/**
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT] [IMPL-METHODOLOGY-LEARNING-EXPERIMENT]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "./constants.js";
import {
  listMethodologyLearningExperiments,
  upsertMethodologyLearningExperiment,
} from "./store.js";
import {
  validateMethodologyLearningExperiment,
  validateMethodologyLearningExperimentObject,
} from "./validate.js";

function validMinimalRecord(): Record<string, unknown> {
  return {
    schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
    experiment_id: "mle-test-001",
    production_system_surface: "checklist_step",
    methodology_hypothesis: "Hypothesis text",
    methodology_baseline: { snapshot_at: "2026-10-01T00:00:00Z" },
    proof_boundary: "Shape only",
    privacy_tier: "operator_local",
    methodology_outcome_observation: {
      value: "inconclusive",
      recorded_at: "2026-10-10T12:00:00Z",
    },
    rule_reversal: { applied: false, rationale: "Pilot" },
  };
}

describe("methodology learning experiment validate [REQ-METHODOLOGY-LEARNING-EXPERIMENT]", () => {
  it("accepts minimal valid record", () => {
    const result = validateMethodologyLearningExperimentObject(validMinimalRecord());
    assert.equal(result.ok, true);
    assert.equal(result.diagnostics.length, 0);
  });

  it("rejects wrong schema_version", () => {
    const record = { ...validMinimalRecord(), schema_version: "wrong.v0" };
    const result = validateMethodologyLearningExperimentObject(record);
    assert.equal(result.ok, false);
  });

  it("rejects missing experiment_id", () => {
    const record = { ...validMinimalRecord(), experiment_id: "" };
    const result = validateMethodologyLearningExperimentObject(record);
    assert.equal(result.ok, false);
  });

  it("requires exactly one of record or yaml_text", () => {
    const result = validateMethodologyLearningExperiment({});
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.path === "$input"));
  });

  it("parses yaml_text", () => {
    const yamlText = `
schema_version: ${METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION}
experiment_id: mle-yaml-1
production_system_surface: gate_policy
methodology_hypothesis: H
proof_boundary: P
privacy_tier: operator_local
`;
    const result = validateMethodologyLearningExperiment({ yaml_text: yamlText });
    assert.equal(result.ok, true);
  });
});

describe("methodology learning experiment store [REQ-METHODOLOGY-LEARNING-EXPERIMENT]", () => {
  it("upserts and lists experiments in temp base path", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mle-store-"));
    const first = upsertMethodologyLearningExperiment(validMinimalRecord(), tmp);
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.created, true);

    const updated = {
      ...validMinimalRecord(),
      methodology_hypothesis: "Updated hypothesis",
    };
    const second = upsertMethodologyLearningExperiment(updated, tmp);
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.created, false);

    const listed = listMethodologyLearningExperiments(tmp);
    assert.equal(listed.experiments.length, 1);
    assert.equal(listed.experiments[0]?.methodology_hypothesis, "Updated hypothesis");
  });
});
