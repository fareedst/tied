import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildCfg } from "./pseudocode-cfg.js";
import {
  checkRefinementEntailment,
  emptyRefinementFactEnv,
} from "./pseudocode-constraint-entailment.js";
import {
  isConstraintAnnotatedProcedure,
  runIntraproceduralConstraintAnalysis,
} from "./pseudocode-constraint-language.js";
import { parseRefinementPredicate } from "./pseudocode-constraint-predicate.js";
import { DEFAULT_BUDGETS, GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { DEFAULT_TYPED_FLOW_BUDGETS, runTypedFlowAnalysis } from "./pseudocode-typed-flow.js";
import { typeFactFromTag } from "./pseudocode-typed-ir.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "constraint-language");
const typedFlowFixtureDir = path.join(analysisRoot, "fixtures", "typed-flow");

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function analyzeConstraintFixture(source: string) {
  const parsed = parsePseudocodeToIr(source);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("parse failed");
  const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
  const typed = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
  const constraint = runIntraproceduralConstraintAnalysis(
    parsed.program,
    cfg.section,
    typed.section,
  );
  return { parsed, typed, constraint };
}

describe("pseudocode-constraint-predicate [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("parses comparisons, null checks, length bounds, AND/OR/NOT", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const cases = [
      "length(items) > 0",
      "count >= 0",
      "x is not null",
      "user.active is defined",
      "length(items) > 0 AND count >= 0",
      "NOT x is not null",
    ];
    for (const text of cases) {
      const result = parseRefinementPredicate(text);
      assert.equal(result.ok, true, text);
      assert.ok(result.ok && result.predicate.ast);
    }
  });

  it("returns predicate_unsupported for custom calls (not silent)", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const result = parseRefinementPredicate("custom_predicate(data) === magic");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.cause, "predicate_unsupported");
  });
});

describe("pseudocode-constraint-entailment [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("proves length(items) > 0 when length bound assumed", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const typeEnv = new Map([["items", typeFactFromTag({ kind: "list", element: { kind: "named", name: "int" } })]]);
    const env = emptyRefinementFactEnv(typeEnv);
    env.lengthBounds.set("items", { min: 1 });
    const parsed = parseRefinementPredicate("length(items) > 0");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const result = checkRefinementEntailment(env, parsed.predicate, { max_predicate_nodes: 512, max_solver_steps: 256, max_summary_depth: 8 });
    assert.equal(result.outcome, "proven_true");
  });

  it("detects proven false as refinement violation candidate", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const typeEnv = new Map([["count", typeFactFromTag({ kind: "scalar", tag: "int" })]]);
    const env = emptyRefinementFactEnv(typeEnv);
    env.scalarBounds.set("count", { exact: 0 });
    const parsed = parseRefinementPredicate("count >= 1");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const result = checkRefinementEntailment(env, parsed.predicate, { max_predicate_nodes: 512, max_solver_steps: 256, max_summary_depth: 8 });
    assert.equal(result.outcome, "proven_false");
  });
});

describe("pseudocode-constraint-language corpus [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("loads cl-07..cl-12 constraint corpus fixtures", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith(".pseudocode.md"));
    assert.ok(files.length >= 40);
  });

  it("CL-1 cl-07: length refinement provable — no violation, refinements proven", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-1 case 12 positive path
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-07-refinement-quantifier-pos.pseudocode.md"),
    );
    const section = constraint.section;
    assert.equal(
      section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
    assert.ok(section.refinements_proven >= 1, "expected at least one proven refinement");
    assert.ok(
      section.refinements_checked >= section.refinements_proven,
      "checked count should include proven refinements",
    );
  });

  it("cl-08: emits REFINEMENT_VIOLATION on proven POST violation", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-08-refinement-violation-neg.pseudocode.md"),
    );
    assert.ok(
      constraint.section.diagnostics.some(
        (d) => d.code === "REFINEMENT_VIOLATION" && d.severity === "warning",
      ),
    );
  });

  it("cl-09: collection bounds refinements proven without violation", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-COLL-001
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-09-refinement-bounds.pseudocode.md"),
    );
    assert.equal(
      constraint.section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
    assert.ok(constraint.section.refinements_proven >= 2);
  });

  it("cl-10: record field refinement proven at PRE", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-SHAPE-001
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-10-field-refinement.pseudocode.md"),
    );
    assert.ok(constraint.section.refinements_proven >= 1);
    assert.equal(
      constraint.section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
  });

  it("cl-11: PRE/POST partial positive — y >= x proven at return", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-PRE/POST
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-11-pre-post-entailment.pseudocode.md"),
    );
    assert.ok(constraint.section.refinements_proven >= 2);
    assert.equal(
      constraint.section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
  });

  it("cl-12: unsupported predicate yields unknown (not silent)", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { constraint } = analyzeConstraintFixture(
      loadFixture("corpus-cl-12-predicate-unsupported-unknown.pseudocode.md"),
    );
    assert.ok(constraint.section.unknowns.length >= 1);
    assert.ok(
      constraint.section.unknowns.some(
        (u) => u.cause === "predicate_unsupported" || u.cause === "CONSTRAINT_UNSUPPORTED_SYNTAX",
      ),
    );
    assert.equal(
      constraint.section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
  });

  it("CL-1 case 12 v2: length(items) > 0 provable; typed-flow v1 path stays unknown", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const v1Source = fs.readFileSync(
      path.join(typedFlowFixtureDir, "corpus-df-12-refinement-pre.pseudocode.md"),
      "utf8",
    );
    const v1 = analyzeConstraintFixture(v1Source);
    assert.equal(v1.parsed.program.grammar_version, "pseudocode-grammar.v1");
    assert.ok(v1.typed.section.unknowns.length >= 1, "typed-flow v1 leaves refinement unknown");
    assert.equal(v1.constraint.section.refinements_checked, 0, "v1 without v2 refinements skips constraint pass");

    const v2Source = `Grammar-Version: v2

procedure EXAMPLE:
  Contract:
    INPUT: items: list of int where length(items) > 0
    OUTPUT: first: int
    PRE: length(items) > 0
    POST: first selected
    EFFECTS: pure
  IF length(items) > 0:
    first := items[0]
  RETURN first
`;
    const v2 = analyzeConstraintFixture(v2Source);
    assert.equal(v2.parsed.program.grammar_version, GRAMMAR_VERSION_V2);
    assert.ok(v2.constraint.section.refinements_proven >= 1, "v2 constraint pass proves length refinement");
    assert.equal(
      v2.constraint.section.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"),
      false,
    );
  });

  it("CONSTRAINT_ANNOTATED_PROCEDURE_DETECTION: v2 header alone does not annotate prose-only", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadFixture("corpus-cl-05-v1-compat-no-header.pseudocode.md");
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const proc = parsed.program.procedures[0]!;
    assert.equal(isConstraintAnnotatedProcedure(proc, parsed.program.grammar_version ?? "pseudocode-grammar.v1"), false);
  });

  it("CONSTRAINT_ANNOTATED_PROCEDURE_DETECTION: refinement annotates procedure", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const { parsed } = analyzeConstraintFixture(
      loadFixture("corpus-cl-07-refinement-quantifier-pos.pseudocode.md"),
    );
    const proc = parsed.program.procedures[0]!;
    assert.equal(isConstraintAnnotatedProcedure(proc, GRAMMAR_VERSION_V2), true);
  });

  it("F8: typed-flow corpus unchanged when constraint analysis not invoked via analyzer", () => {
    // [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] regression — constraint pass is opt-in internal API only in Slice 3
    const files = fs
      .readdirSync(typedFlowFixtureDir)
      .filter((name) => name.endsWith(".pseudocode.md"))
      .sort();
    assert.equal(files.length, 28);
    for (const file of files) {
      const source = fs.readFileSync(path.join(typedFlowFixtureDir, file), "utf8");
      const parsed = parsePseudocodeToIr(source);
      assert.equal(parsed.ok, true, file);
    }
  });
});
