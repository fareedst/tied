import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { DEFAULT_PROOF_BOUNDARY } from "../analysis/pseudocode-ir.js";
import {
  extendProofBoundaryForAsyncBoundary,
  extendProofBoundaryForTypedFlow,
} from "../analysis/pseudocode-analyze-report.js";
import { allTools } from "./index.js";

type TextContent = { content: Array<{ type: "text"; text: string }> };

function handler(name: string): (args: Record<string, unknown>) => Promise<TextContent> {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`MCP tool not registered: ${name}`);
  return tool.handler as (args: Record<string, unknown>) => Promise<TextContent>;
}

function body(result: TextContent): Record<string, unknown> {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

describe("pseudocode_analyze MCP [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("returns analysis report for inline pseudocode", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const result = await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: `# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y`,
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
    });
    const value = body(result);
    assert.equal(value.schema_version, "pseudocode-analysis-report.v1");
    assert.equal(value.grammar_version, "pseudocode-grammar.v1");
    assert.equal(value.proof_boundary, DEFAULT_PROOF_BOUNDARY);
  });

  it("does not mutate project TIED YAML when invoked", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const tiedBase = path.resolve(import.meta.dirname, "../../../tied");
    const requirementsPath = path.join(tiedBase, "requirements.yaml");
    const before = fs.readFileSync(requirementsPath, "utf8");
    await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: `# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y`,
    });
    const after = fs.readFileSync(requirementsPath, "utf8");
    assert.equal(before, after);
  });

  it("rejects ambiguous inline and path input", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const result = await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: "procedure X:",
      essence_pseudocode_path: "implementation-decisions/x.md",
    });
    const value = body(result);
    assert.equal(value.ok, false);
    assert.equal(value.error, "AMBIGUOUS_INPUT");
  });

  it("rejects path escape outside TIED base", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "pseudo-out-"));
    const f = path.join(outside, "escape.md");
    fs.writeFileSync(f, "procedure X:", "utf8");
    try {
      const result = await handler("pseudocode_analyze")({
        token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
        essence_pseudocode_path: f,
      });
      const value = body(result);
      assert.equal(value.ok, false);
      assert.equal(value.error, "PATH_NOT_UNDER_TIED_BASE");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it("propagates gate_mode and sets gate_mode_applied on success", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const failing = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: "procedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  CALL MISSING()\n  RETURN y",
      gate_mode: true,
    }));
    assert.equal(failing.ok, false);
    assert.equal(failing.gate_mode_applied, true);

    const passing = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      pseudocode: "# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]\nprocedure MAIN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y",
      known_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
      gate_mode: true,
    }));
    assert.equal(passing.ok, true);
    assert.equal(passing.gate_mode_applied, true);
  });

  it("coexists with pseudocode_validate unchanged schema", async () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const pseudo = `# [IMPL-QUALITY_PSEUDOCODE_VALIDATOR]\nprocedure RUN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y`;
    const validate = body(await handler("pseudocode_validate")({
      token: "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      pseudocode: pseudo,
    }));
    const analyze = body(await handler("pseudocode_analyze")({
      token: "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
      pseudocode: pseudo,
      analyses: ["parse"],
    }));
    assert.equal(validate.schema_version, "layer-b-pseudocode-validator.v1");
    assert.equal(analyze.schema_version, "pseudocode-analysis-report.v1");
  });

  it("propagates typed_flow flag and emits sections.typed_flow when true", async () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const legacy = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: false,
    }));
    const typed = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true,
    }));
    assert.equal(legacy.proof_boundary, DEFAULT_PROOF_BOUNDARY);
    assert.equal((legacy.sections as Record<string, unknown> | undefined)?.typed_flow, undefined);
    assert.ok((typed.sections as Record<string, unknown>).typed_flow);
    assert.equal(typed.proof_boundary, extendProofBoundaryForTypedFlow(DEFAULT_PROOF_BOUNDARY));
  });

  it("propagates typed_gate_errors and fails gate on annotated typed violations", async () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`;
    const promoted = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: source,
      typed_flow: true,
      gate_mode: true,
      typed_gate_errors: true,
    }));
    assert.equal(promoted.ok, false);
    assert.equal(promoted.gate_mode_applied, true);
    const diagnostics = promoted.diagnostics as Array<{ code: string; severity: string }>;
    assert.ok(diagnostics.some((d) => d.code === "TYPE_MISMATCH" && d.severity === "error"));
  });

  it("propagates constraint_flow flag and emits sections.constraint_language when true", async () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = `Grammar-Version: v2\nprocedure COUNT_NEGATIVE:\n  Contract:\n    INPUT: items: list of int\n    OUTPUT: count: int\n    PRE: true\n    POST: count >= 1\n    EFFECTS: pure\n  count := 0\n  RETURN count`;
    const legacy = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: false,
    }));
    const constraint = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
    }));
    assert.equal((legacy.sections as Record<string, unknown> | undefined)?.constraint_language, undefined);
    assert.ok((constraint.sections as Record<string, unknown>).constraint_language);
  });

  it("propagates constraint_gate_errors and fails gate on proven constraint violations", async () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = `Grammar-Version: v2\nprocedure COUNT_NEGATIVE:\n  Contract:\n    INPUT: items: list of int\n    OUTPUT: count: int\n    PRE: true\n    POST: count >= 1\n    EFFECTS: pure\n  count := 0\n  RETURN count`;
    const promoted = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
      gate_mode: true,
      constraint_gate_errors: true,
    }));
    assert.equal(promoted.ok, false);
    assert.equal(promoted.gate_mode_applied, true);
    const diagnostics = promoted.diagnostics as Array<{ code: string; severity: string }>;
    assert.ok(diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "error"));
  });

  it("defaults constraint_gate_errors effective true under gate_mode when flags omitted (sub-phase 3d)", async () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = `Grammar-Version: v2\nprocedure COUNT_NEGATIVE:\n  Contract:\n    INPUT: items: list of int\n    OUTPUT: count: int\n    PRE: true\n    POST: count >= 1\n    EFFECTS: pure\n  count := 0\n  RETURN count`;
    const promoted = body(await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      typed_flow: true,
      constraint_flow: true,
      gate_mode: true,
    }));
    assert.equal(promoted.ok, false);
    const diagnostics = promoted.diagnostics as Array<{ code: string; severity: string }>;
    assert.ok(diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "error"));
  });

  it("propagates async_boundary flag and emits sections.async_boundary when true", async () => {
    // [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
    const source = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
  RETURN y`;
    const legacy = body(await handler("pseudocode_analyze")({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      async_boundary: false,
    }));
    const asyncReport = body(await handler("pseudocode_analyze")({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      async_boundary: true,
    }));
    assert.equal((legacy.sections as Record<string, unknown> | undefined)?.async_boundary, undefined);
    assert.ok((asyncReport.sections as Record<string, unknown>).async_boundary);
    assert.equal(asyncReport.proof_boundary, extendProofBoundaryForAsyncBoundary(DEFAULT_PROOF_BOUNDARY));
  });

  it("propagates async_gate_errors and fails gate on ASYNC_EFFECTS_WITHOUT_BOUNDARY", async () => {
    // [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
    const source = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
  RETURN y`;
    const promoted = body(await handler("pseudocode_analyze")({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      async_boundary: true,
      gate_mode: true,
      async_gate_errors: true,
    }));
    assert.equal(promoted.ok, false);
    const diagnostics = promoted.diagnostics as Array<{ code: string; severity: string }>;
    assert.ok(
      diagnostics.some(
        (d) => d.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY" && d.severity === "error",
      ),
    );
  });

  it("async_boundary composes with typed_flow without duplicating AWAIT_NON_PROMISE_OUTPUT", async () => {
    // [IMPL-ASYNC_BOUNDARY_ANALYZER] [REQ-ASYNC_BOUNDARY_ANALYSIS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const source = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: Async
    ASYNC_BOUNDARY: await
  AWAIT step_one`;
    const report = body(await handler("pseudocode_analyze")({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      typed_flow: true,
      async_boundary: true,
    }));
    const asyncSection = (report.sections as { async_boundary?: { diagnostics: Array<{ code: string }> } })
      .async_boundary;
    assert.ok(asyncSection);
    assert.equal(
      asyncSection!.diagnostics.some((d) => d.code === "AWAIT_NON_PROMISE_OUTPUT"),
      false,
    );
  });

  it("typed_flow true does not mutate project TIED YAML", async () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const tiedBase = path.resolve(import.meta.dirname, "../../../tied");
    const requirementsPath = path.join(tiedBase, "requirements.yaml");
    const before = fs.readFileSync(requirementsPath, "utf8");
    await handler("pseudocode_analyze")({
      token: "IMPL-PSEUDOCODE_TYPED_FLOW",
      pseudocode: `procedure EXAMPLE:\n  Contract:\n    INPUT: x: int\n    OUTPUT: y: int\n    PRE: true\n    POST: true\n    EFFECTS: pure\n  x := "hello"`,
      typed_flow: true,
    });
    const after = fs.readFileSync(requirementsPath, "utf8");
    assert.equal(before, after);
  });
});
