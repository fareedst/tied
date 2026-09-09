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
    });
    assert.equal(result.ok, false);
  });
});
