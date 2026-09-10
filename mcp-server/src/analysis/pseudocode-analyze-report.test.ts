import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeInputIdentity,
  extendProofBoundaryForConstraintFlow,
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

  it("extendProofBoundaryForConstraintFlow appends constraint-language claim limits", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const extended = extendProofBoundaryForConstraintFlow(DEFAULT_PROOF_BOUNDARY);
    assert.notEqual(extended, DEFAULT_PROOF_BOUNDARY);
    assert.ok(extended.includes("Constraint-language"));
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

  it("F9: constraint_language report section serialization is deterministic", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = `Grammar-Version: v2\nprocedure COUNT_NEGATIVE:\n  Contract:\n    INPUT: items: list of int\n    OUTPUT: count: int\n    PRE: true\n    POST: count >= 1\n    EFFECTS: pure\n  count := 0\n  RETURN count`;
    const input = {
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true as const,
      constraint_flow: true as const,
    };
    const first = analyzeEssencePseudocode(input);
    const second = analyzeEssencePseudocode(input);
    if (!("schema_version" in first) || !("schema_version" in second)) return;
    assert.equal(serializeAnalysisReport(first), serializeAnalysisReport(second));
    const section = first.sections.constraint_language;
    assert.ok(section);
    assert.equal(typeof section!.procedures_analyzed, "number");
    assert.ok(Array.isArray(section!.diagnostics));
    assert.ok(section!.diagnostics.every((d) => d.severity === "warning" || d.severity === "error"));
    assert.ok(Array.isArray(section!.unknowns));
  });
});
