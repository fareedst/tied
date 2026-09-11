import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractSemanticTokens,
  isBlockLeadCommentLine,
  parseContractFields,
  scanProcedureBlocks,
} from "./pseudocode-shared.js";

describe("pseudocode-shared [REQ-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("extractSemanticTokens finds REQ/ARCH/IMPL tokens in source order", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
    const text = "# [IMPL-A] [ARCH-B] [REQ-C]\n# [REQ-C]";
    assert.deepEqual(extractSemanticTokens(text), ["IMPL-A", "ARCH-B", "REQ-C", "REQ-C"]);
    assert.deepEqual(extractSemanticTokens(text, { unique: true }), ["ARCH-B", "IMPL-A", "REQ-C"]);
  });

  it("scanProcedureBlocks returns stable ranges for procedure/function/block", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
    const lines = [
      "procedure MAIN:",
      "  Contract:",
      "    INPUT: x",
      "function HELPER:",
      "  RETURN y",
      "block TAIL:",
      "  RETURN z",
    ];
    const ranges = scanProcedureBlocks(lines);
    assert.deepEqual(
      ranges.map((range) => ({ name: range.name, kind: range.kind, start: range.start, end: range.end })),
      [
        { name: "MAIN", kind: "procedure", start: 0, end: 3 },
        { name: "HELPER", kind: "function", start: 3, end: 5 },
        { name: "TAIL", kind: "block", start: 5, end: 7 },
      ],
    );
  });

  it("scanProcedureBlocks attaches external pre-procedure block-leads to the following procedure", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [REQ-PSEUDOCODE_STATIC_ANALYSIS] — How: upward walk includes contiguous external block-leads.
    const lines = [
      "procedure FIRST:",
      "  RETURN ok",
      "# [IMPL-SECOND] [ARCH-B] [REQ-C]",
      "procedure SECOND:",
      "  RETURN ok",
    ];
    const ranges = scanProcedureBlocks(lines);
    assert.equal(ranges[1]?.tokenScanStart, 2);
    assert.equal(ranges[1]?.tokenScanEnd, 5);
    assert.equal(ranges[0]?.tokenScanStart, 0);
    assert.equal(ranges[0]?.tokenScanEnd, 2);
  });

  it("scanProcedureBlocks excludes trailing inter-procedure block-leads from the previous procedure token scan", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [REQ-PSEUDOCODE_STATIC_ANALYSIS] — How: trim tokenScanEnd before inter-procedure block-leads.
    const lines = [
      "procedure FIRST:",
      "  RETURN ok",
      "# [IMPL-SECOND] [ARCH-B] [REQ-C]",
      "procedure SECOND:",
      "  RETURN ok",
    ];
    const ranges = scanProcedureBlocks(lines);
    assert.equal(ranges[0]?.tokenScanEnd, 2);
    assert.equal(ranges[0]?.end, 3);
  });

  it("isBlockLeadCommentLine recognizes semantic block-lead comments only", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    assert.equal(isBlockLeadCommentLine("# [IMPL-A] How: summary"), true);
    assert.equal(isBlockLeadCommentLine("  # [REQ-B]"), true);
    assert.equal(isBlockLeadCommentLine("# Summary only"), false);
    assert.equal(isBlockLeadCommentLine("procedure MAIN:"), false);
  });

  it("parseContractFields preserves first-seen field order without duplicates", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
    const fields = parseContractFields([
      "  Contract:",
      "    INPUT: x",
      "    OUTPUT: y",
      "    PRE: x",
      "    INPUT: duplicate ignored",
      "    POST: y",
      "    EFFECTS: pure",
    ]);
    assert.deepEqual(fields, ["INPUT", "OUTPUT", "PRE", "POST", "EFFECTS"]);
  });

  it("handles empty input without throwing", () => {
    // [IMPL-PSEUDOCODE_SHARED_PRIMITIVES] [ARCH-PSEUDOCODE_PARSER_UNIFICATION] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
    assert.deepEqual(extractSemanticTokens(""), []);
    assert.deepEqual(scanProcedureBlocks([]), []);
    assert.deepEqual(parseContractFields([]), []);
  });
});
