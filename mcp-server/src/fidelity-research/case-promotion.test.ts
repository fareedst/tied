import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promoteConfirmedCase } from "./case-promotion.js";

describe("PROMOTE_CONFIRMED_CASE REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Promotes one adjudicated finding to a case report without automatic product specification mutation.
  it("requires independent review and keeps product writes disabled", () => {
    const result = promoteConfirmedCase({
      findingId: "finding-1",
      originLayer: "IMPL-to-code-defect",
      divergentEdge: "IMPL->code",
      specificationState: "ImplementationLag",
      evidenceReferences: ["snapshot-1", "audit-1"],
      reviewers: ["reviewer-a", "reviewer-b"],
    });

    assert.equal(result.kind, "case-report");
    assert.equal(result.caseReport.findingId, "finding-1");
    assert.equal(result.caseReport.productTiedMutation, false);
  });

  it("does not promote a finding with one reviewer", () => {
    const result = promoteConfirmedCase({
      findingId: "finding-1",
      originLayer: "unresolved",
      divergentEdge: "unknown",
      specificationState: "Unresolved",
      evidenceReferences: [],
      reviewers: ["reviewer-a"],
    });

    assert.deepEqual(result, { kind: "not-promoted", reason: "IndependentReviewRequired" });
  });
});
