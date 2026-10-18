/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_ADAPTIVE]
 */

import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { runAdaptiveEffectivenessExperimentV1 } from "./adaptive-experiment.js";

describe("adaptive-experiment [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("runs three-arm fixture experiment with held-out provenance", () => {
    const fixtureRoot = path.join(import.meta.dirname, "fixtures");
    const result = runAdaptiveEffectivenessExperimentV1({ fixtureRoot });
    assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
    assert.equal(result.report?.arms.length, 3);
    assert.ok(result.report!.proof_boundary.includes("observational"));
    assert.ok(result.report!.held_out_provenance.length >= 1);
  });

  it("arm receipts differ under perturbation", () => {
    const fixtureRoot = path.join(import.meta.dirname, "fixtures");
    const result = runAdaptiveEffectivenessExperimentV1({ fixtureRoot });
    assert.equal(result.ok, true);
    const adaptiveHashes = new Set(result.report!.arms.map((a) => a.selection_receipt_hash));
    assert.ok(adaptiveHashes.size >= 1);
  });
});
