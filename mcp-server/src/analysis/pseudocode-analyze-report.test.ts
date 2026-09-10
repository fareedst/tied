import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeInputIdentity,
  extendProofBoundaryForTypedFlow,
  mergeBudgets,
  serializeAnalysisReport,
  sortDiagnostics,
} from "./pseudocode-analyze-report.js";
import { DEFAULT_PROOF_BOUNDARY } from "./pseudocode-ir.js";
import { analyzeEssencePseudocode } from "./pseudocode-analyzer.js";

describe("pseudocode-analyze-report helpers [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("computes stable input identity across line endings", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    assert.equal(
      computeInputIdentity("a\nb").hash,
      computeInputIdentity("a\r\nb").hash,
    );
  });

  it("sorts diagnostics by line then code", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const sorted = sortDiagnostics([
      { severity: "warning", code: "DEREF_OBLIGATION", message: "z", line: 5 },
      { severity: "error", code: "UNRESOLVED_CALL", message: "a", line: 1 },
    ]);
    assert.equal(sorted[0].line, 1);
  });

  it("mergeBudgets preserves defaults for unspecified keys", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const { effective } = mergeBudgets({});
    assert.ok(effective.max_parse_nodes > 0);
  });

  it("extendProofBoundaryForTypedFlow appends typed-flow claim limits", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const extended = extendProofBoundaryForTypedFlow(DEFAULT_PROOF_BOUNDARY);
    assert.notEqual(extended, DEFAULT_PROOF_BOUNDARY);
    assert.ok(extended.startsWith(DEFAULT_PROOF_BOUNDARY));
  });

  it("F9: typed_flow report serialization is deterministic", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const input = {
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true as const,
    };
    const first = analyzeEssencePseudocode(input);
    const second = analyzeEssencePseudocode(input);
    if (!("schema_version" in first) || !("schema_version" in second)) return;
    assert.equal(serializeAnalysisReport(first), serializeAnalysisReport(second));
    const section = first.sections.typed_flow;
    assert.ok(section);
    assert.equal(typeof section!.procedures_analyzed, "number");
    assert.ok(Array.isArray(section!.diagnostics));
    assert.ok(Array.isArray(section!.unknowns));
    assert.equal(typeof section!.join_iterations_applied, "number");
  });
});
