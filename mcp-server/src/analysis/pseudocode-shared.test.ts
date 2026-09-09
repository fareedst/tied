import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractSemanticTokens,
  parseContractFields,
  scanProcedureBlocks,
} from "./pseudocode-shared.js";

describe("pseudocode-shared [REQ-PSEUDOCODE_PARSER_UNIFICATION]", () => {
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
