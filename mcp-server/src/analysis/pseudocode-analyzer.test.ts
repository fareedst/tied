import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  computeInputIdentity,
  extendProofBoundaryForConstraintFlow,
  extendProofBoundaryForTypedFlow,
  mergeBudgets,
  serializeAnalysisReport,
  sortDiagnostics,
} from "./pseudocode-analyze-report.js";
import { DEFAULT_PROOF_BOUNDARY, REPORT_SCHEMA_VERSION } from "./pseudocode-ir.js";
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
    assert.equal(report.proof_boundary, DEFAULT_PROOF_BOUNDARY);
    assert.equal(serializeAnalysisReport(report), serializeAnalysisReport(report));
  });

  it("gate_mode: UNRESOLVED_CALL fails ok", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  CALL MISSING()\n  RETURN y`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      gate_mode: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, false);
    assert.equal(report.gate_mode_applied, true);
    assert.ok(report.diagnostics.some((d) => d.code === "UNRESOLVED_CALL" && d.severity === "error"));
  });

  it("gate_mode: truncated report fails ok", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x:\n    CALL HELPER()\n  IF y:\n    CALL HELPER()\n  RETURN y\nprocedure HELPER:\n  Contract:\n    INPUT: a\n    OUTPUT: b\n    PRE: a\n    POST: b\n    EFFECTS: pure\n  RETURN b`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      gate_mode: true,
      budgets: { max_parse_nodes: 2 },
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.truncated, true);
    assert.equal(report.ok, false);
    assert.equal(report.gate_mode_applied, true);
  });

  it("gate_mode: warning-only diagnostics pass ok", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x:\n    RETURN y\n  RETURN y`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
      gate_mode: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, true);
    assert.equal(report.gate_mode_applied, true);
    assert.ok(!report.diagnostics.some((d) => d.severity === "error"));
  });

  it("non-gate_mode: UNRESOLVED_CALL does not fail ok by default", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  CALL MISSING()\n  RETURN y`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, true);
    assert.equal(report.gate_mode_applied, undefined);
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

  it("F8: typed_flow false is byte-identical to legacy default report", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x:\n    RETURN y\n  RETURN y`;
    const legacy = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
    });
    const explicitFalse = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: source,
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
      typed_flow: false,
    });
    if (!("schema_version" in legacy) || !("schema_version" in explicitFalse)) return;
    assert.equal(serializeAnalysisReport(legacy), serializeAnalysisReport(explicitFalse));
    assert.equal(legacy.proof_boundary, DEFAULT_PROOF_BOUNDARY);
    assert.equal(explicitFalse.sections.typed_flow, undefined);
  });

  it("typed_flow true emits sections.typed_flow and extends proof_boundary", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true,
    });
    if (!("schema_version" in report)) return;
    assert.ok(report.sections.typed_flow);
    assert.ok(report.sections.typed_flow!.diagnostics.some((d) => d.code === "TYPE_MISMATCH"));
    assert.equal(report.proof_boundary, extendProofBoundaryForTypedFlow(DEFAULT_PROOF_BOUNDARY));
    assert.equal(report.ok, true);
  });

  it("gate_mode: typed_gate_errors false keeps warnings-only on annotated procedures", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true,
      gate_mode: true,
      typed_gate_errors: false,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, true);
    assert.equal(report.gate_mode_applied, true);
    assert.ok(report.sections.typed_flow!.diagnostics.length > 0);
    assert.equal(
      report.diagnostics.some((d) => d.code === "TYPE_MISMATCH" && d.severity === "error"),
      false,
    );
  });

  it("gate_mode: default typed_gate_errors promotes annotated TYPE_MISMATCH to gate failure (Phase 3d)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true,
      gate_mode: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, false);
    assert.equal(report.gate_mode_applied, true);
    assert.ok(
      report.diagnostics.some((d) => d.code === "TYPE_MISMATCH" && d.severity === "error"),
    );
  });

  it("gate_mode: typed_flow false ignores typed_gate_errors (F8 regression)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: false,
      gate_mode: true,
      typed_gate_errors: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, true);
    assert.equal(report.sections.typed_flow, undefined);
  });
});

const constraintFixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "analysis",
  "fixtures",
  "constraint-language",
);

function loadConstraintFixture(name: string): string {
  return fs.readFileSync(path.join(constraintFixtureDir, name), "utf8");
}

describe("pseudocode-analyzer constraint_flow [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("F8: constraint_flow false is byte-identical to typed-flow Phase 3 baseline", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    const typedBaseline = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
    });
    const constraintOff = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: false,
    });
    if (!("schema_version" in typedBaseline) || !("schema_version" in constraintOff)) return;
    assert.equal(serializeAnalysisReport(typedBaseline), serializeAnalysisReport(constraintOff));
    assert.equal(constraintOff.sections.constraint_language, undefined);
  });

  it("constraint_flow true coerces typed_flow and emits sections.constraint_language", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      constraint_flow: true,
    });
    if (!("schema_version" in report)) return;
    assert.ok(report.sections.typed_flow);
    assert.ok(report.sections.constraint_language);
    assert.ok(
      report.sections.constraint_language!.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
    );
    assert.equal(
      report.proof_boundary,
      extendProofBoundaryForConstraintFlow(extendProofBoundaryForTypedFlow(DEFAULT_PROOF_BOUNDARY)),
    );
  });

  it("CL-6: v1 sidecar with constraint_flow true emits zero constraint diagnostics", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
    });
    if (!("schema_version" in report)) return;
    assert.ok(report.sections.constraint_language);
    assert.equal(report.sections.constraint_language!.diagnostics.length, 0);
    assert.equal(report.sections.constraint_language!.unknowns.length, 0);
  });

  it("gate_mode: constraint_gate_errors false keeps warnings-only on constraint violations", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
      gate_mode: true,
      constraint_gate_errors: false,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, true);
    assert.equal(
      report.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "error"),
      false,
    );
  });

  it("gate_mode: default constraint_gate_errors promotes REFINEMENT_VIOLATION to gate failure (sub-phase 3d)", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
      gate_mode: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, false);
    assert.ok(
      report.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "error"),
    );
  });

  it("gate_mode: constraint_gate_errors true promotes REFINEMENT_VIOLATION to gate failure", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
      gate_mode: true,
      constraint_gate_errors: true,
    });
    if (!("schema_version" in report)) return;
    assert.equal(report.ok, false);
    assert.ok(
      report.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "error"),
    );
  });

  it("F9: constraint_flow report serialization is deterministic", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadConstraintFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md");
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
  });
});
