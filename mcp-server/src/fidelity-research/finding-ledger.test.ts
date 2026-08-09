import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendCandidateFinding,
  createFindingLedger,
} from "./finding-ledger.js";

describe("APPEND_CANDIDATE_FINDING REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Appends an observation without treating it as a confirmed product defect.
  it("appends a candidate finding in the observed lifecycle state", () => {
    const ledger = createFindingLedger();
    const result = appendCandidateFinding(ledger, {
      project: "/tmp/research-project",
      revision: "abc123",
      scope: "IMPL-EXAMPLE",
      category: "missing-specification",
      severity: "warning",
      confidence: "medium",
      visibility: "developer-visible",
      discoverySource: "agent",
      evidence: [{ path: "src/example.ts", line: 12 }],
    });

    assert.equal(result.kind, "appended");
    assert.equal(result.finding.lifecycle, "observed");
    assert.equal(ledger.findings.length, 1);
  });

  it("links a duplicate without overwriting the original observation", () => {
    const ledger = createFindingLedger();
    const finding = {
      project: "/tmp/research-project",
      revision: "abc123",
      scope: "IMPL-EXAMPLE",
      category: "missing-specification",
      severity: "warning",
      confidence: "medium",
      visibility: "developer-visible",
      discoverySource: "agent",
      evidence: [{ path: "src/example.ts", line: 12 }],
    } as const;

    const first = appendCandidateFinding(ledger, finding);
    const duplicate = appendCandidateFinding(ledger, finding);

    assert.equal(first.kind, "appended");
    assert.equal(duplicate.kind, "duplicate");
    assert.equal(ledger.findings.length, 1);
    assert.equal(ledger.duplicateLinks.length, 1);
  });
});
