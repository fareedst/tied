import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";

describe("pseudocode-cfg [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("builds entry, branch, and exit nodes with reachability", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  IF x:\n    RETURN y\n  RETURN y`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const { section } = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const cfg = section.procedures[0];
    assert.ok(cfg.nodes.some((n) => n.kind === "entry"));
    assert.ok(cfg.nodes.some((n) => n.kind === "branch"));
    assert.ok(cfg.nodes.some((n) => n.kind === "exit"));
    assert.ok(cfg.reachable.length > 0);
  });
});
