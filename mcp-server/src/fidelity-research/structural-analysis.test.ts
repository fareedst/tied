import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runStructuralAnalysis } from "./structural-analysis.js";

describe("RUN_STRUCTURAL_ANALYSIS REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Runs structural validators while explicitly limiting their proof claim.
  it("records validator calls with a structural-only proof boundary", () => {
    const calls: string[] = [];
    const result = runStructuralAnalysis({
      snapshotId: "snapshot-1",
      tokens: ["IMPL-TIED_FIDELITY_RESEARCH"],
      validators: {
        tiedConsistency: (tokens) => {
          calls.push(`tied:${tokens.join(",")}`);
          return { ok: true };
        },
        pseudocode: (token) => {
          calls.push(`pseudo:${token}`);
          return { ok: true };
        },
        traceability: () => {
          calls.push("traceability");
          return { ok: true };
        },
        cycles: () => {
          calls.push("cycles");
          return { ok: true };
        },
        bindingInventory: () => {
          calls.push("binding");
          return { ok: true };
        },
        testAdequacy: () => {
          calls.push("adequacy");
          return { ok: true };
        },
      },
    });

    assert.deepEqual(calls, [
      "tied:IMPL-TIED_FIDELITY_RESEARCH",
      "pseudo:IMPL-TIED_FIDELITY_RESEARCH",
      "traceability",
      "cycles",
      "binding",
      "adequacy",
    ]);
    assert.equal(result.evidence.length, 6);
    assert.equal(
      result.proofBoundary,
      "Structural artifact consistency only; not runtime correctness.",
    );
  });
});
