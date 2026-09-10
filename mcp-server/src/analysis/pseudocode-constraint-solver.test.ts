import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildCallGraph } from "./pseudocode-call-graph.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { resolveConstraintBudgets, runConstraintAnalysis } from "./pseudocode-constraint-language.js";
import type { ConstraintAnalysisBudgets } from "./pseudocode-constraint-ir.js";
import { detectSummaryConflicts, runConstraintSolver } from "./pseudocode-constraint-solver.js";
import { DEFAULT_BUDGETS, GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { DEFAULT_TYPED_FLOW_BUDGETS, runTypedFlowAnalysis } from "./pseudocode-typed-flow.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "constraint-language");

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function analyzeConstraintWithSolver(source: string, budgets?: Partial<ConstraintAnalysisBudgets>) {
  const parsed = parsePseudocodeToIr(source);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("parse failed");
  const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
  const callGraph = buildCallGraph(parsed.program, DEFAULT_BUDGETS);
  const typed = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
  const constraint = runConstraintAnalysis(
    parsed.program,
    callGraph.section,
    cfg.section,
    typed.section,
    resolveConstraintBudgets(budgets ?? {}),
  );
  return { parsed, typed, callGraph, constraint };
}

describe("pseudocode-constraint-solver [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("detectSummaryConflicts flags incompatible SUMMARY RETURN ensures", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { parsed } = analyzeConstraintWithSolver(
      loadFixture("corpus-cl-16-summary-conflict.pseudocode.md"),
    );
    const proc = parsed.program.procedures[0]!;
    const conflicts = detectSummaryConflicts(proc);
    assert.ok(conflicts.some((d) => d.code === "SUMMARY_CONFLICT"));
  });

  it("cl-13: interproc summary propagates; no summary_missing on declared callee", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-CALL/RET
    const { constraint } = analyzeConstraintWithSolver(
      loadFixture("corpus-cl-13-interproc-summary-pos.pseudocode.md"),
    );
    const section = constraint.section;
    assert.equal(section.interproc_enabled, true);
    assert.ok((section.solver_metadata?.interproc_facts_propagated ?? 0) >= 1);
    assert.equal(
      section.unknowns.some((u) => u.cause === "summary_missing"),
      false,
    );
    assert.ok(section.refinements_proven >= 1, "interproc POST should be proven via propagated summary");
  });

  it("cl-14: missing callee summary yields summary_missing unknown (CL-4)", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-4
    const { constraint } = analyzeConstraintWithSolver(
      loadFixture("corpus-cl-14-interproc-summary-missing-unknown.pseudocode.md"),
    );
    assert.ok(constraint.section.unknowns.some((u) => u.cause === "summary_missing"));
  });

  it("cl-15: low max_solver_steps sets solver_metadata.solver_truncation (CL-5)", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-5
    const { constraint } = analyzeConstraintWithSolver(
      loadFixture("corpus-cl-15-solver-budget-exceeded.pseudocode.md"),
      { max_solver_steps: 0, max_summary_depth: 8 },
    );
    assert.equal(constraint.section.solver_metadata?.solver_truncation, true);
    assert.ok(constraint.section.solver_metadata?.truncation_cause);
    assert.ok(constraint.section.solver_metadata?.budgets_applied);
  });

  it("cl-16: SUMMARY_CONFLICT diagnostic present in full constraint analysis", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-16
    const { constraint } = analyzeConstraintWithSolver(
      loadFixture("corpus-cl-16-summary-conflict.pseudocode.md"),
    );
    assert.ok(
      constraint.section.diagnostics.some((d) => d.code === "SUMMARY_CONFLICT" && d.severity === "warning"),
    );
  });

  it("runConstraintSolver returns metadata with budgets_applied", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadFixture("corpus-cl-13-interproc-summary-pos.pseudocode.md");
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.program.grammar_version, GRAMMAR_VERSION_V2);
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const callGraph = buildCallGraph(parsed.program, DEFAULT_BUDGETS);
    const typed = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
    const result = runConstraintSolver(parsed.program, callGraph.section, typed.section, {
      max_solver_steps: 256,
      max_summary_depth: 8,
      max_predicate_nodes: 512,
    });
    assert.ok(result.solver_metadata.solver_steps! >= 1);
    assert.equal(result.solver_metadata.solver_truncation, undefined);
  });
});
