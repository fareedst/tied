import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { buildCallGraph } from "./pseudocode-call-graph.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";

describe("pseudocode-call-graph [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("records CALL and RUN edges", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  CALL HELPER()\n  RUN external-tool`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const { section, diagnostics } = buildCallGraph(parsed.program, DEFAULT_BUDGETS);
    assert.ok(section.edges.some((e) => e.kind === "call"));
    assert.ok(section.edges.some((e) => e.kind === "run"));
    assert.ok(diagnostics.some((d) => d.code === "UNRESOLVED_RUN"));
  });
});
