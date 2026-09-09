import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { runAbstractAnalysis } from "./pseudocode-abstract-analysis.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";

describe("pseudocode-abstract-analysis [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("emits null-check and deref obligations", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  ptr := null\n  val := deref ptr`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS).section;
    const { diagnostics } = runAbstractAnalysis(parsed.program, cfg, DEFAULT_BUDGETS, false);
    assert.ok(diagnostics.some((d) => d.code === "DEREF_OBLIGATION"));
    assert.ok(diagnostics.some((d) => d.code === "NULL_CHECK_OBLIGATION"));
  });

  it("detects contradictory paths and respects strict_paths", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF true AND false:`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS).section;
    const loose = runAbstractAnalysis(parsed.program, cfg, DEFAULT_BUDGETS, false);
    const strict = runAbstractAnalysis(parsed.program, cfg, DEFAULT_BUDGETS, true);
    assert.ok(loose.diagnostics.some((d) => d.code === "CONTRADICTORY_PATH" && d.severity === "warning"));
    assert.ok(strict.diagnostics.some((d) => d.code === "CONTRADICTORY_PATH" && d.severity === "error"));
  });

  it("records unknowns when iteration budget exceeded", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const lines = ["procedure MAIN:", "  Contract:", "    INPUT: x", "    OUTPUT: y", "    PRE: x", "    POST: y", "    EFFECTS: pure"];
    for (let i = 0; i < 50; i += 1) lines.push(`  step${i} := ${i}`);
    const parsed = parsePseudocodeToIr(lines.join("\n"));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS).section;
    const { unknowns } = runAbstractAnalysis(parsed.program, cfg, { ...DEFAULT_BUDGETS, max_fixed_point_iterations: 5 }, false);
    assert.ok(unknowns.length > 0);
  });
});
