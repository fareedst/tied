import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeEssencePseudocode } from "./pseudocode-analyzer.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { DEFAULT_BUDGETS, DEFAULT_PROOF_BOUNDARY } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import {
  extendProofBoundaryForAsyncBoundary,
  extendProofBoundaryForTypedFlow,
} from "./pseudocode-analyze-report.js";
import {
  applyAsyncGateSeverityPromotion,
  ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT,
  isAsyncGateErrorsEffective,
  runAsyncBoundaryAnalysis,
} from "./pseudocode-async-boundary.js";

const ASYNC_SOURCE = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
  RETURN y`;

const CLEAN_ASYNC_SOURCE = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
    ASYNC_BOUNDARY: await
  AWAIT step_one`;

describe("pseudocode-async-boundary [REQ-ASYNC_BOUNDARY_ANALYSIS]", () => {
  it("async_boundary false leaves report unchanged (analyzer-off)", () => {
    const legacy = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: ASYNC_SOURCE,
      async_boundary: false,
    });
    const defaultReport = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: ASYNC_SOURCE,
    });
    if (!("schema_version" in legacy) || !("schema_version" in defaultReport)) {
      throw new Error("expected report");
    }
    assert.equal(legacy.sections.async_boundary, undefined);
    assert.equal(defaultReport.sections.async_boundary, undefined);
    assert.equal(legacy.proof_boundary, DEFAULT_PROOF_BOUNDARY);
  });

  it("async_boundary true emits sections.async_boundary and extends proof_boundary", () => {
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: ASYNC_SOURCE,
      async_boundary: true,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    assert.ok(report.sections.async_boundary);
    assert.ok(
      report.sections.async_boundary!.diagnostics.some(
        (d) => d.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY",
      ),
    );
    assert.equal(report.proof_boundary, extendProofBoundaryForAsyncBoundary(DEFAULT_PROOF_BOUNDARY));
    assert.match(report.proof_boundary, /deadlock|livelock|data races/);
    assert.doesNotMatch(report.proof_boundary, /race-free|deadlock-free/i);
  });

  it("defers AWAIT_NON_PROMISE_OUTPUT to typed-flow when typed_flow is enabled", () => {
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
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      async_boundary: true,
      typed_flow: true,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    const asyncCodes = report.sections.async_boundary?.diagnostics.map((d) => d.code) ?? [];
    assert.equal(asyncCodes.includes("AWAIT_NON_PROMISE_OUTPUT"), false);
  });

  it("async_gate_errors false keeps warnings-only", () => {
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: ASYNC_SOURCE,
      async_boundary: true,
      gate_mode: true,
      async_gate_errors: false,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    assert.equal(report.ok, true);
    assert.ok(
      report.sections.async_boundary!.diagnostics.some(
        (d) => d.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY" && d.severity === "warning",
      ),
    );
  });

  it("async_gate_errors true promotes ASYNC_EFFECTS_WITHOUT_BOUNDARY to gate failure", () => {
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: ASYNC_SOURCE,
      async_boundary: true,
      gate_mode: true,
      async_gate_errors: true,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    assert.equal(report.ok, false);
    assert.ok(
      report.diagnostics.some(
        (d) => d.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY" && d.severity === "error",
      ),
    );
  });

  it("isAsyncGateErrorsEffective requires explicit async_gate_errors true", () => {
    assert.equal(
      isAsyncGateErrorsEffective({ gate_mode: true, async_boundary: true }),
      false,
    );
    assert.equal(
      isAsyncGateErrorsEffective({
        gate_mode: true,
        async_boundary: true,
        async_gate_errors: true,
      }),
      true,
    );
  });

  it("applyAsyncGateSeverityPromotion only promotes gating async codes", () => {
    const parsed = parsePseudocodeToIr(ASYNC_SOURCE);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS).section;
    const { section } = runAsyncBoundaryAnalysis(parsed.program, cfg, { source: ASYNC_SOURCE });
    const promoted = applyAsyncGateSeverityPromotion(section);
    assert.ok(
      promoted.diagnostics.some(
        (d) => d.code === "ASYNC_EFFECTS_WITHOUT_BOUNDARY" && d.severity === "error",
      ),
    );
  });

  it("clean async fixture passes gate with async_gate_errors", () => {
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: CLEAN_ASYNC_SOURCE,
      async_boundary: true,
      gate_mode: true,
      async_gate_errors: true,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    assert.equal(report.ok, true);
  });

  it("proof boundary supplement is structural-only", () => {
    assert.match(ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT, /structure and type consistency/i);
    assert.doesNotMatch(ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT, /race-free|deadlock-free/i);
  });

  it("async_boundary runs after typed-flow when both enabled", () => {
    const source = `# [IMPL-ASYNC_BOUNDARY_ANALYZER]
procedure FIXTURE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: Async
    ASYNC_BOUNDARY: await
  AWAIT step_one
  x := "hello"`;
    const report = analyzeEssencePseudocode({
      token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
      pseudocode: source,
      typed_flow: true,
      async_boundary: true,
    });
    if (!("schema_version" in report)) throw new Error("expected report");
    assert.ok(report.sections.typed_flow);
    assert.ok(report.sections.async_boundary);
    assert.equal(
      report.proof_boundary,
      extendProofBoundaryForAsyncBoundary(extendProofBoundaryForTypedFlow(DEFAULT_PROOF_BOUNDARY)),
    );
  });
});
