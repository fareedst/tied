/**
 * [IMPL-TIED_BOUNDED_PILOT_BUDGET] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validatePilotBudget } from "./pilot-budget.js";
import { BOUNDED_PROOF_BOUNDARIES } from "./constants.js";

function goldenBudget(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: "pilot-budget.v1",
    bounded_composition_opt_in: true,
    k: 4,
    mode: "parallel",
    seed: "seed-stable-1",
    run_namespace: "bc-ns-1",
    cost_ceiling: { max_units: 100 },
    stop_criteria: [{ kind: "max_failures", threshold: 1 }],
    rollout_budget: { max_units: 50 },
    improvement_stage_budget: { max_units: 25 },
    timeout_retry_policy: { timeout_ms: 60_000, max_retries: 2 },
    ...overrides,
  };
}

describe("validatePilotBudget [IMPL-TIED_BOUNDED_PILOT_BUDGET]", () => {
  it("rejects default-off when context opt-in is false", () => {
    const result = validatePilotBudget(goldenBudget(), { bounded_composition_opt_in: false });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "OptInRequired");
  });

  it("rejects document without bounded_composition_opt_in", () => {
    const doc = goldenBudget();
    delete (doc as Record<string, unknown>).bounded_composition_opt_in;
    const result = validatePilotBudget(doc, { bounded_composition_opt_in: true });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "OptInRequired");
  });

  it("accepts a closed pilot-budget.v1 document", () => {
    const result = validatePilotBudget(goldenBudget(), { bounded_composition_opt_in: true });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.budget.k, 4);
    assert.equal(result.budget.mode, "parallel");
    assert.deepEqual(result.budget.proof_boundaries, [BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn]);
  });

  it("records R=4k/P=3k accounting_formula as mechanics-only", () => {
    const result = validatePilotBudget(
      goldenBudget({ accounting_formula: { R: "4k", P: "3k" } }),
      { bounded_composition_opt_in: true },
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.budget.accounting_formula?.R, "4k");
    assert.equal(result.budget.accounting_formula?.P, "3k");
    assert.equal(
      result.budget.accounting_formula?.proof_boundary,
      BOUNDED_PROOF_BOUNDARIES.harness2MechanicsNotEffectiveness,
    );
  });

  it("rejects k=0 and invalid mode", () => {
    for (const candidate of [
      goldenBudget({ k: 0 }),
      goldenBudget({ mode: "fanout" }),
      goldenBudget({ stop_criteria: [] }),
    ]) {
      const result = validatePilotBudget(candidate, { bounded_composition_opt_in: true });
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.error.code, "InvalidPilotBudget");
    }
  });

  it("rejects duplicate run_namespace", () => {
    const result = validatePilotBudget(goldenBudget(), {
      bounded_composition_opt_in: true,
      active_run_namespaces: ["bc-ns-1"],
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "DuplicateNamespace");
  });
});
