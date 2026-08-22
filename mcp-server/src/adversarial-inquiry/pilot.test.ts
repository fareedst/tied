import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calibratePilot } from "./pilot.js";

describe("CALIBRATE_PILOT REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("requires representative evidence before strict promotion", () => {
    const result = calibratePilot({
      sampleSize: 10,
      truePositives: 2,
      falsePositives: 1,
      reviewerAgreements: 8,
      reviewerComparisons: 10,
      negativeControlsDetected: true,
      deterministicScope: true,
      explicitProofBoundaries: true,
      waiverSupport: true,
      representativeEvidence: false,
      localMinutes: 1,
      ciMinutes: 2,
      consecutiveBudgetBreaches: 0,
    });

    assert.equal(result.precision, 2 / 3);
    assert.equal(result.reviewerAgreement, 0.8);
    assert.equal(result.eligibleForStrict, false);
    assert.ok(result.diagnostics.includes("representative_evidence_required"));
  });

  it("stops expansion after two budget breaches and accepts an eligible pilot", () => {
    const result = calibratePilot({
      sampleSize: 20,
      truePositives: 18,
      falsePositives: 2,
      reviewerAgreements: 19,
      reviewerComparisons: 20,
      negativeControlsDetected: true,
      deterministicScope: true,
      explicitProofBoundaries: true,
      waiverSupport: true,
      representativeEvidence: true,
      localMinutes: 6,
      ciMinutes: 16,
      consecutiveBudgetBreaches: 2,
    });

    assert.equal(result.precision, 0.9);
    assert.equal(result.eligibleForStrict, true);
    assert.equal(result.stopExpansion, true);
    assert.deepEqual(result.diagnostics, ["local_budget_exceeded", "ci_budget_exceeded"]);
  });
});
