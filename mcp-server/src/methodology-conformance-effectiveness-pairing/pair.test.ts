import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pairConformanceEffectiveness } from "./pair.js";

// [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
describe("pairConformanceEffectiveness", () => {
  it("detects conformance_only_trap when gate receipt without outcome", () => {
    const report = pairConformanceEffectiveness({
      conformance_evidence_refs: [
        { kind: "gate_receipt", path: "working/REQ/evidence/pre_implementation-gate-result.json" },
      ],
      methodology_outcome_observation: null,
    });
    assert.equal(report.disposition, "conformance_only_trap");
    assert.equal(report.ok, false);
  });

  it("paired when inconclusive outcome with typed conformance refs", () => {
    const report = pairConformanceEffectiveness({
      conformance_evidence_refs: [
        { kind: "gate_receipt", path: "working/REQ/evidence/pre_implementation-gate-result.json" },
      ],
      methodology_outcome_observation: {
        value: "inconclusive",
        evidence_refs: [{ kind: "file_path", path: "tied-project/working/REQ/evidence/x.md" }],
      },
      experiment_proof_boundary: "Does not prove hypothesis.",
    });
    assert.equal(report.disposition, "paired");
    assert.equal(report.ok, true);
  });

  it("requires process grade gap for not_measured", () => {
    const report = pairConformanceEffectiveness({
      conformance_evidence_refs: [{ kind: "file_path", path: "a.json" }],
      methodology_outcome_observation: { value: "not_measured" },
      process_grade_gap_documented: false,
    });
    assert.equal(report.disposition, "effectiveness_not_measured");
    assert.equal(report.ok, false);
  });

  it("allows waived disposition with owner and expiry", () => {
    const report = pairConformanceEffectiveness({
      waiver: { owner: "sponsor", expiry: "2027-01-01", rationale: "pilot" },
      conformance_evidence_refs: [{ kind: "gate_receipt", path: "x.json" }],
      methodology_outcome_observation: null,
    });
    assert.equal(report.disposition, "waived");
    assert.equal(report.ok, true);
  });

  it("rejects generic prose conformance refs", () => {
    const report = pairConformanceEffectiveness({
      conformance_evidence_refs: ["tests passed"],
      methodology_outcome_observation: { value: "inconclusive" },
    });
    assert.ok(report.diagnostics.some((d) => d.code === "generic_prose_ref"));
  });
});
