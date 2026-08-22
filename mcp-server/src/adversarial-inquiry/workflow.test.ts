import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendFinding,
  projectScopedStatus,
  validateStrictEligibility,
} from "./workflow.js";
import type { FindingLedger } from "./workflow.js";

describe("APPEND_FINDING REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("keeps observations append-only and links deterministic duplicates", () => {
    const ledger: FindingLedger = { findings: [], duplicateLinks: [] };
    const input = {
      obligationId: "block-1",
      blockRevision: "rev-1",
      dimension: "semantic_fidelity" as const,
      statementId: "step-1",
      message: "missing effect",
      evidenceRefs: ["test-1"],
      proofBoundary: "semantic_fidelity" as const,
    };

    const first = appendFinding(ledger, input);
    const second = appendFinding(ledger, { ...input, evidenceRefs: ["test-1", "prod-1"] });

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(ledger.findings.length, 1);
    assert.deepEqual(ledger.duplicateLinks, [[second.finding.id, first.finding.id]]);
    assert.deepEqual(ledger.findings[0]?.evidenceRefs, ["test-1"]);
  });
});

describe("VALIDATE_STRICT_ELIGIBILITY REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("rejects strict mode when any eligibility control is absent", () => {
    const result = validateStrictEligibility({
      scope: ["block-1"],
      negativeControls: ["detector-a"],
      blockingDetectors: ["detector-a", "detector-b"],
      boundedExecution: true,
      explicitProofBoundaries: true,
      falsePositiveHandling: true,
      waiversOwned: true,
      representativePilot: true,
    });

    assert.equal(result.eligible, false);
    assert.ok(result.diagnostics.some((item) => item.code === "missing_negative_control"));
  });

  it("accepts a complete eligible subset and keeps status scoped", () => {
    const eligibility = validateStrictEligibility({
      scope: ["block-1"],
      negativeControls: ["detector-a"],
      blockingDetectors: ["detector-a"],
      boundedExecution: true,
      explicitProofBoundaries: true,
      falsePositiveHandling: true,
      waiversOwned: true,
      representativePilot: true,
    });
    const status = projectScopedStatus({
      scope: ["block-1"],
      obligations: [
        { id: "block-1", verdict: "PASS" },
        { id: "unrelated", verdict: "UNRELIABLE" },
      ],
      eligibility,
    });

    assert.equal(eligibility.eligible, true);
    assert.deepEqual(status, { "block-1": "PASS" });
  });
});
