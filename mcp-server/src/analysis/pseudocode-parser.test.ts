import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parsePseudocodeToIr, serializeIrProgram } from "./pseudocode-parser.js";
import { GRAMMAR_VERSION } from "./pseudocode-ir.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "analysis",
  "fixtures",
  "pseudocode-analysis",
);

describe("pseudocode-parser [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("parses procedures, branches, calls, and contracts from fixture", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = fs.readFileSync(path.join(fixtureDir, "minimal-branches.pseudocode.md"), "utf8");
    const result = parsePseudocodeToIr(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.program.grammar_version, GRAMMAR_VERSION);
    assert.equal(result.program.procedures.length, 2);
    assert.ok(result.program.procedures.some((p) => p.name === "MAIN"));
    assert.ok(result.program.procedures.some((p) => p.name === "HELPER"));
    const main = result.program.procedures.find((p) => p.name === "MAIN")!;
    assert.ok(main.statements.some((s) => s.kind === "if"));
    assert.ok(main.statements.some((s) => s.kind === "call"));
  });

  it("reports unsupported_syntax for unknown constructs", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `# test\nprocedure X:\n  Contract:\n    INPUT: a\n    OUTPUT: b\n    PRE: a\n    POST: b\n    EFFECTS: pure\n  ??? invalid token line`;
    const result = parsePseudocodeToIr(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.program.unsupported_syntax.length > 0);
  });

  it("serializes IR deterministically", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const source = `procedure A:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y`;
    const r1 = parsePseudocodeToIr(source);
    const r2 = parsePseudocodeToIr(source.replace(/\n/g, "\r\n"));
    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    if (!r1.ok || !r2.ok) return;
    assert.equal(serializeIrProgram(r1.program), serializeIrProgram(r2.program));
  });

  it("retains mixed typed and prose contract rows (F1b)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure MIXED:
  Contract:
    INPUT: user_id: int
    INPUT: session description prose
    OUTPUT: result: string
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN result`;
    const result = parsePseudocodeToIr(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const proc = result.program.procedures.find((p) => p.name === "MIXED")!;
    assert.equal(proc.contract.entries?.length, 6);
    assert.equal(proc.contract.values?.INPUT, "session description prose");
    assert.equal(proc.contract.type_tags?.user_id?.kind, "scalar");
  });

  it("captures CALL args and optional arg expressions (F6)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure MAIN:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL HELPER( x, "bad" )`;
    const result = parsePseudocodeToIr(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const call = result.program.procedures[0].statements.find((s) => s.kind === "call");
    assert.ok(call && call.kind === "call");
    if (!call || call.kind !== "call") return;
    assert.deepEqual(call.args, ["x", '"bad"']);
    assert.equal(call.arg_exprs?.[0]?.kind, "ref");
    assert.equal(call.arg_exprs?.[1]?.kind, "literal");
  });

  it("rejects oversized input", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const result = parsePseudocodeToIr("xx", {
      max_parse_nodes: 5000,
      max_procedures: 256,
      max_cfg_blocks_per_procedure: 512,
      max_call_graph_edges: 2048,
      max_fixed_point_iterations: 32,
      max_path_conditions: 64,
      max_report_diagnostics: 500,
      max_source_bytes: 1,
      max_cfg_join_iterations: 32,
    });
    assert.equal(result.ok, false);
  });
});
