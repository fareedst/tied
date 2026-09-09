import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { analyzeSymbols } from "./pseudocode-symbols.js";

describe("pseudocode-symbols [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("resolves CALL targets and reports unresolved symbols", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  CALL MISSING()`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const { section, diagnostics } = analyzeSymbols(parsed.program, "IMPL-PSEUDOCODE_ANALYSIS_ENGINE");
    assert.ok(section.unresolved_calls.length > 0);
    assert.ok(diagnostics.some((d) => d.code === "UNRESOLVED_CALL"));
  });

  it("flags missing contract fields", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure MAIN:\n  RETURN x`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const { diagnostics } = analyzeSymbols(parsed.program, "IMPL-PSEUDOCODE_ANALYSIS_ENGINE");
    assert.ok(diagnostics.some((d) => d.code === "MISSING_CONTRACT_FIELD"));
  });
});
