import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeSpecificationState } from "./specification-state.js";

describe("ANALYZE_SPECIFICATION_STATE REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Establishes approved prior/current behavior before classifying evidence as a defect.
  it("classifies an approved behavior change separately from a regression", () => {
    const result = analyzeSpecificationState({
      prior: { approved: true, behavior: "returns the cached value" },
      current: { approved: true, behavior: "recomputes the value" },
      observedBehavior: "recomputes the value",
    });

    assert.deepEqual(result, {
      classification: "SpecificationChange",
      currentBehavior: "recomputes the value",
      desiredBehavior: "recomputes the value",
    });
  });

  it("classifies implementation lag when current intent is approved", () => {
    const result = analyzeSpecificationState({
      prior: { approved: true, behavior: "returns the cached value" },
      current: { approved: true, behavior: "recomputes the value" },
      observedBehavior: "returns the cached value",
    });

    assert.equal(result.classification, "ImplementationLag");
  });
});
