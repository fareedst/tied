import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCfg } from "./pseudocode-cfg.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { runTypedFlowAnalysis } from "./pseudocode-typed-flow.js";

describe("pseudocode-typed-flow [REQ-PSEUDOCODE_TYPED_FLOW]", () => {
  it("detects TYPE_MISMATCH on scalar assignment (F4)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  x := "hello"`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const result = runTypedFlowAnalysis(parsed.program, cfg.section);
    assert.ok(result.section.diagnostics.some((d) => d.code === "TYPE_MISMATCH"));
  });

  it("detects CALL_TYPE_MISMATCH for incompatible args (F6)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure CALLEE:
  Contract:
    INPUT: n: int
    OUTPUT: r: int
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN r

procedure CALLER:
  Contract:
    INPUT: v: string
    OUTPUT: out: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL CALLEE( "bad" )`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const result = runTypedFlowAnalysis(parsed.program, cfg.section);
    assert.ok(result.section.diagnostics.some((d) => d.code === "CALL_TYPE_MISMATCH"));
  });

  it("emits unknowns for opaque RUN targets (F7)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  RUN fetch_user_input`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const result = runTypedFlowAnalysis(parsed.program, cfg.section);
    assert.ok(result.section.unknowns.some((u) => u.cause === "TYPED_OPAQUE_EXPR"));
  });

  it("detects JOIN_INCOMPATIBLE after branch merge (F2/F5)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:
  Contract:
    INPUT: flag: bool
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  IF flag:
    x := 1
  ELSE:
    x := "two"`;
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const result = runTypedFlowAnalysis(parsed.program, cfg.section);
    assert.ok(result.section.diagnostics.some((d) => d.code === "JOIN_INCOMPATIBLE"));
  });
});
