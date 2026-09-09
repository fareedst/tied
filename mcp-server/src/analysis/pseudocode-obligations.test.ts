import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { runAbstractAnalysis } from "./pseudocode-abstract-analysis.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { extractObligations } from "./pseudocode-obligations.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";

describe("pseudocode-obligations [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("extracts decision tables and traceability edges", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `# header\nprocedure MAIN:\n  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x > 0:\n    RETURN y`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS).section;
    const abs = runAbstractAnalysis(parsed.program, cfg, DEFAULT_BUDGETS, false).section;
    const { obligations, traceability } = extractObligations(parsed.program, abs);
    assert.ok(obligations.decision_tables.length > 0);
    assert.ok(traceability.block_edges.some((e) => e.block === "MAIN"));
    assert.ok(traceability.block_edges[0].tokens.includes("IMPL-PSEUDOCODE_ANALYSIS_ENGINE"));
  });
});
