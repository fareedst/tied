import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeInputIdentity,
  mergeBudgets,
  serializeAnalysisReport,
  sortDiagnostics,
} from "./pseudocode-analyze-report.js";
import { REPORT_SCHEMA_VERSION } from "./pseudocode-ir.js";
import { analyzeEssencePseudocode } from "./pseudocode-analyzer.js";

describe("pseudocode-analyze-report [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("computes stable input identity", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const a = computeInputIdentity("hello\nworld");
    const b = computeInputIdentity("hello\r\nworld");
    assert.equal(a.hash, b.hash);
    assert.equal(a.algorithm, "sha256");
  });

  it("sorts diagnostics deterministically", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const sorted = sortDiagnostics([
      { severity: "warning", code: "DEREF_OBLIGATION", message: "b", line: 2 },
      { severity: "error", code: "UNRESOLVED_CALL", message: "a", line: 1 },
    ]);
    assert.equal(sorted[0].line, 1);
  });

  it("mergeBudgets applies overrides", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const { effective } = mergeBudgets({ max_parse_nodes: 100 });
    assert.equal(effective.max_parse_nodes, 100);
  });
});

describe("pseudocode-analyzer orchestrator [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("returns pseudocode-analysis-report.v1 for valid input", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x:\n    RETURN y\n  RETURN y`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
    });
    assert.equal("schema_version" in report && report.schema_version, REPORT_SCHEMA_VERSION);
    if (!("schema_version" in report)) return;
    assert.ok(report.sections.parse);
    assert.ok(report.proof_boundary.length > 0);
    assert.equal(serializeAnalysisReport(report), serializeAnalysisReport(report));
  });

  it("mutation: inverted branch changes obligations", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const base = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x > 0:\n    RETURN y`;
    const mutated = base.replace("x > 0", "x <= 0");
    const r1 = analyzeEssencePseudocode({ token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE", pseudocode: base });
    const r2 = analyzeEssencePseudocode({ token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE", pseudocode: mutated });
    if (!("schema_version" in r1) || !("schema_version" in r2)) return;
    const o1 = JSON.stringify(r1.sections.obligations);
    const o2 = JSON.stringify(r2.sections.obligations);
    assert.notEqual(o1, o2);
  });
});
