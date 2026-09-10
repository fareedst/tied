import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { analyzeEssencePseudocode } from "./pseudocode-analyzer.js";
import { serializeAnalysisReport } from "./pseudocode-analyze-report.js";
import { buildCallGraph } from "./pseudocode-call-graph.js";
import { buildCfg } from "./pseudocode-cfg.js";
import type { ConstraintDiagnosticCode } from "./pseudocode-constraint-ir.js";
import {
  GATING_CONSTRAINT_DIAGNOSTIC_CODES,
  resolveConstraintBudgets,
  runConstraintAnalysis,
} from "./pseudocode-constraint-language.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import { DEFAULT_TYPED_FLOW_BUDGETS, runTypedFlowAnalysis } from "./pseudocode-typed-flow.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const constraintFixtureDir = path.join(analysisRoot, "fixtures", "constraint-language");
const typedFlowFixtureDir = path.join(analysisRoot, "fixtures", "typed-flow");

type ConstraintCorpusEntry = {
  id: string;
  file: string;
  source: "constraint-language" | "typed-flow";
  definiteError?: ConstraintDiagnosticCode | ConstraintDiagnosticCode[];
  positiveControl?: boolean;
  requireUnknown?: boolean;
  forbidGatingError?: boolean;
  v1NoConstraint?: boolean;
  budgetProbe?: boolean;
  gateScoping?: boolean;
  loopPartial?: boolean;
  f1bMixed?: boolean;
};

const GATING_CODES = GATING_CONSTRAINT_DIAGNOSTIC_CODES as readonly ConstraintDiagnosticCode[];

const CONSTRAINT_CORPUS: ConstraintCorpusEntry[] = [
  { id: "cl-01", file: "corpus-cl-01-v2-header-refinement.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-02", file: "corpus-cl-02-v2-summary-decl.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-03", file: "corpus-cl-03-v2-alias-policy.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-04", file: "corpus-cl-04-v2-immutable-data.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-05", file: "corpus-cl-05-v1-compat-no-header.pseudocode.md", source: "constraint-language", v1NoConstraint: true, positiveControl: true },
  { id: "cl-06", file: "corpus-cl-06-v2-mixed-v1-constructs.pseudocode.md", source: "constraint-language", f1bMixed: true, positiveControl: true },
  { id: "cl-07", file: "corpus-cl-07-refinement-quantifier-pos.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-08", file: "corpus-cl-08-refinement-violation-neg.pseudocode.md", source: "constraint-language", definiteError: "REFINEMENT_VIOLATION" },
  { id: "cl-09", file: "corpus-cl-09-refinement-bounds.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-10", file: "corpus-cl-10-field-refinement.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-11", file: "corpus-cl-11-pre-post-entailment.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-12", file: "corpus-cl-12-predicate-unsupported-unknown.pseudocode.md", source: "constraint-language", requireUnknown: true, forbidGatingError: true },
  { id: "cl-13", file: "corpus-cl-13-interproc-summary-pos.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-14", file: "corpus-cl-14-interproc-summary-missing-unknown.pseudocode.md", source: "constraint-language", requireUnknown: true, forbidGatingError: true },
  { id: "cl-15", file: "corpus-cl-15-solver-budget-exceeded.pseudocode.md", source: "constraint-language", budgetProbe: true },
  { id: "cl-16", file: "corpus-cl-16-summary-conflict.pseudocode.md", source: "constraint-language", definiteError: "SUMMARY_CONFLICT" },
  { id: "cl-17", file: "corpus-cl-17-mutation-violation.pseudocode.md", source: "constraint-language", definiteError: "MUTATION_VIOLATION" },
  { id: "cl-18", file: "corpus-cl-18-mutation-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-19", file: "corpus-cl-19-alias-policy-violation.pseudocode.md", source: "constraint-language", definiteError: "ALIAS_VIOLATION" },
  { id: "cl-20", file: "corpus-cl-20-alias-policy-absent-unknown.pseudocode.md", source: "constraint-language", requireUnknown: true, forbidGatingError: true },
  { id: "cl-21", file: "corpus-cl-21-v1-immutable-prose-unknown.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-22", file: "corpus-cl-22-loop-invariant-partial.pseudocode.md", source: "constraint-language", loopPartial: true, forbidGatingError: true },
  { id: "cl-23", file: "corpus-cl-23-gate-annotated-vs-prose.pseudocode.md", source: "constraint-language", gateScoping: true, definiteError: "REFINEMENT_VIOLATION" },
  { id: "cl-24", file: "corpus-cl-24-positive-refinement-chain-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-25", file: "corpus-cl-25-positive-bounds-window-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-26", file: "corpus-cl-26-positive-interproc-chain-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-27", file: "corpus-cl-27-positive-immutable-read-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-28", file: "corpus-cl-28-positive-alias-compliant-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-29", file: "corpus-cl-29-ref-typed-scalar-mismatch.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-30", file: "corpus-cl-30-ref-typed-nullable-flow.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-31", file: "corpus-cl-31-ref-typed-collection-shape.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-32", file: "corpus-cl-32-ref-typed-branch-join.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-33", file: "corpus-cl-33-ref-typed-run-external.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-34", file: "corpus-cl-34-ref-typed-opaque-condition.pseudocode.md", source: "constraint-language", v1NoConstraint: true },
  { id: "cl-35", file: "corpus-cl-35-positive-list-length-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-36", file: "corpus-cl-36-positive-record-field-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-37", file: "corpus-cl-37-positive-pre-entailment-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-38", file: "corpus-cl-38-positive-guarded-null-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-39", file: "corpus-cl-39-positive-summary-call-pass.pseudocode.md", source: "constraint-language", positiveControl: true },
  { id: "cl-40", file: "corpus-cl-40-positive-v1-no-constraint-diagnostics.pseudocode.md", source: "constraint-language", v1NoConstraint: true, positiveControl: true },
];

const TYPED_FLOW_REUSE: ConstraintCorpusEntry[] = [
  { id: "tf-01", file: "corpus-df-01-scalar-type-mismatch.pseudocode.md", source: "typed-flow", v1NoConstraint: true },
  { id: "tf-02", file: "corpus-df-02-nullable-unguarded.pseudocode.md", source: "typed-flow", v1NoConstraint: true },
  { id: "tf-03", file: "corpus-df-03-collection-shape-mismatch.pseudocode.md", source: "typed-flow", v1NoConstraint: true },
  { id: "tf-05", file: "corpus-df-05-branch-join-incompatible.pseudocode.md", source: "typed-flow", v1NoConstraint: true },
  { id: "tf-09", file: "corpus-df-09-run-external.pseudocode.md", source: "typed-flow", v1NoConstraint: true, requireUnknown: true },
  { id: "tf-10", file: "corpus-df-10-opaque-if-condition.pseudocode.md", source: "typed-flow", v1NoConstraint: true, requireUnknown: true },
];

const ALL_LABELED = [...CONSTRAINT_CORPUS, ...TYPED_FLOW_REUSE];

function fixtureDir(entry: ConstraintCorpusEntry): string {
  return entry.source === "typed-flow" ? typedFlowFixtureDir : constraintFixtureDir;
}

function loadFixture(entry: ConstraintCorpusEntry): string {
  return fs.readFileSync(path.join(fixtureDir(entry), entry.file), "utf8");
}

function analyzeConstraint(source: string, constraintGateErrors = false) {
  return analyzeEssencePseudocode({
    token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
    pseudocode: source,
    gate_mode: true,
    typed_flow: true,
    constraint_flow: true,
    constraint_gate_errors: constraintGateErrors,
  });
}

function analyzeConstraintOff(source: string) {
  return analyzeEssencePseudocode({
    token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
    pseudocode: source,
    gate_mode: true,
    typed_flow: true,
    typed_gate_errors: true,
    constraint_flow: false,
  });
}

function constraintSection(report: ReturnType<typeof analyzeEssencePseudocode>) {
  if (!("schema_version" in report)) return undefined;
  return report.sections.constraint_language;
}

function hasGatingConstraintError(section: NonNullable<ReturnType<typeof constraintSection>>): boolean {
  return section.diagnostics.some((d) => GATING_CODES.includes(d.code));
}

function hasExpectedDefiniteError(
  section: NonNullable<ReturnType<typeof constraintSection>>,
  entry: ConstraintCorpusEntry,
): boolean {
  if (!entry.definiteError) return true;
  const expected = Array.isArray(entry.definiteError) ? entry.definiteError : [entry.definiteError];
  return expected.some((code) => section.diagnostics.some((d) => d.code === code));
}

describe("pseudocode-constraint corpus [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]", () => {
  it("F1: loads >=40 constraint fixtures and typed-flow reuse entries", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const constraintFiles = fs
      .readdirSync(constraintFixtureDir)
      .filter((name) => name.endsWith(".pseudocode.md"));
    assert.ok(constraintFiles.length >= 40, `expected >=40 constraint fixtures, got ${constraintFiles.length}`);
    assert.equal(CONSTRAINT_CORPUS.length, 40);
    assert.ok(ALL_LABELED.length >= 46);
    for (const entry of ALL_LABELED) {
      assert.ok(fs.existsSync(path.join(fixtureDir(entry), entry.file)), `missing ${entry.file}`);
      const parsed = parsePseudocodeToIr(loadFixture(entry));
      assert.equal(parsed.ok, true, `${entry.id} must parse`);
    }
  });

  for (const entry of ALL_LABELED) {
    it(`${entry.id} meets labeled expectation via analyzer composition path`, () => {
      // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
      const source = loadFixture(entry);
      const report = analyzeConstraint(source);
      if (!("schema_version" in report)) throw new Error(`${entry.id}: expected report`);
      assert.ok(report.sections.constraint_language, `${entry.id}: constraint section required`);

      const section = report.sections.constraint_language!;

      if (entry.v1NoConstraint) {
        assert.equal(section.diagnostics.length, 0, `${entry.id}: CL-6 zero constraint diagnostics`);
        assert.equal(section.unknowns.length, 0, `${entry.id}: CL-6 zero constraint unknowns`);
        return;
      }

      if (entry.positiveControl || entry.forbidGatingError || entry.loopPartial) {
        assert.equal(
          hasGatingConstraintError(section),
          false,
          `${entry.id}: positive control must not emit gating constraint errors`,
        );
      }

      if (entry.definiteError) {
        assert.ok(
          hasExpectedDefiniteError(section, entry),
          `${entry.id}: expected ${String(entry.definiteError)}`,
        );
      }

      if (entry.requireUnknown) {
        assert.ok(section.unknowns.length >= 1, `${entry.id}: expected >=1 unknown`);
        assert.ok(
          section.unknowns.every((u) => (u.cause ?? "").length > 0),
          `${entry.id}: unknown cause populated`,
        );
      }


      if (entry.f1bMixed) {
        const parsed = parsePseudocodeToIr(source);
        assert.equal(parsed.ok, true);
        if (!parsed.ok) return;
        assert.ok(parsed.program.procedures.length >= 1);
      }

      if (entry.gateScoping) {
        const warningsOnly = analyzeConstraint(source, false);
        const gatePromoted = analyzeConstraint(source, true);
        if (!("schema_version" in warningsOnly) || !("schema_version" in gatePromoted)) return;
        assert.equal(warningsOnly.ok, true, `${entry.id}: warnings-only gate must pass`);
        assert.equal(gatePromoted.ok, false, `${entry.id}: gate promotion must fail on annotated procedure`);
        const proseConstraintErrors =
          gatePromoted.sections.constraint_language?.diagnostics.filter(
            (d) => d.procedure === "PROSE_ONLY" && d.severity === "error",
          ) ?? [];
        assert.equal(proseConstraintErrors.length, 0, `${entry.id}: prose-only procedure must not get constraint gate errors`);
      }
    });
  }

  it("F8: constraint_flow false matches typed-flow Phase 3 path for constraint corpus v1 entries", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const v1Entries = ALL_LABELED.filter((entry) => entry.v1NoConstraint);
    for (const entry of v1Entries) {
      const source = loadFixture(entry);
      const off = analyzeConstraintOff(source);
      const typedOnly = analyzeEssencePseudocode({
        token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
        pseudocode: source,
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
      });
      if (!("schema_version" in off) || !("schema_version" in typedOnly)) continue;
      assert.equal(off.ok, typedOnly.ok, `${entry.id}: gate unchanged with constraint_flow false`);
      assert.equal(off.sections.constraint_language, undefined);
    }
  });

  it("F9: constraint_flow report serialization is deterministic across corpus sample", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    for (const entry of CONSTRAINT_CORPUS.filter((item) => !item.v1NoConstraint).slice(0, 12)) {
      const source = loadFixture(entry);
      const input = {
        token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
        pseudocode: source,
        typed_flow: true as const,
        constraint_flow: true as const,
      };
      const first = analyzeEssencePseudocode(input);
      const second = analyzeEssencePseudocode(input);
      if (!("schema_version" in first) || !("schema_version" in second)) continue;
      assert.equal(serializeAnalysisReport(first), serializeAnalysisReport(second), `${entry.id}: F9 stable`);
    }
  });

  it("F10: zero solver_truncation on non-budget-probe fixtures at default budgets", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    for (const entry of CONSTRAINT_CORPUS.filter((item) => item.source === "constraint-language" && !item.budgetProbe && !item.v1NoConstraint)) {
      const report = analyzeConstraint(loadFixture(entry));
      if (!("schema_version" in report)) continue;
      const section = report.sections.constraint_language;
      assert.equal(section?.solver_metadata?.solver_truncation, undefined, `${entry.id}: F10 no truncation`);
    }
  });

  it("F12: 100% recall on definite-error labeled constraint cases", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const recallCases = CONSTRAINT_CORPUS.filter((entry) => entry.definiteError && !entry.gateScoping);
    const missed = recallCases.filter((entry) => {
      const section = constraintSection(analyzeConstraint(loadFixture(entry)));
      return !section || !hasExpectedDefiniteError(section, entry);
    });
    assert.deepEqual(
      missed.map((entry) => entry.id),
      [],
      `F12 recall gaps: ${missed.map((entry) => entry.id).join(", ")}`,
    );
  });

  it("FP cap: <=5% false gating errors on positive-control fixtures", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const positiveControls = CONSTRAINT_CORPUS.filter((entry) => entry.positiveControl);
    const falsePositives = positiveControls.filter((entry) => {
      const section = constraintSection(analyzeConstraint(loadFixture(entry)));
      return section !== undefined && hasGatingConstraintError(section);
    });
    const fpRate = falsePositives.length / positiveControls.length;
    assert.ok(fpRate <= 0.05, `FP rate ${(fpRate * 100).toFixed(1)}% exceeds 5% cap: ${falsePositives.map((e) => e.id).join(", ")}`);
  });

  it("CL-1: case 12 refinement provable in v2 positive controls", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const positive = CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-07")!;
    const negative = CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-08")!;
    const posSection = constraintSection(analyzeConstraint(loadFixture(positive)));
    assert.ok(posSection);
    assert.ok(posSection!.refinements_proven >= 1);
    const negSection = constraintSection(analyzeConstraint(loadFixture(negative)));
    assert.ok(negSection?.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"));
  });

  it("CL-5: cl-15 discloses solver truncation when budgets capped", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const source = loadFixture(CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-15")!);
    const parsed = parsePseudocodeToIr(source);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
    const callGraph = buildCallGraph(parsed.program, DEFAULT_BUDGETS);
    const typed = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
    const constraint = runConstraintAnalysis(
      parsed.program,
      callGraph.section,
      cfg.section,
      typed.section,
      resolveConstraintBudgets({ max_solver_steps: 0, max_summary_depth: 8, max_predicate_nodes: 512 }),
    );
    assert.equal(constraint.section.solver_metadata?.solver_truncation, true);
  });

  it("CL-2/CL-3/CL-4/CL-6 spot checks via labeled fixtures", () => {
    // [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
    const cl2 = constraintSection(
      analyzeConstraint(loadFixture(CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-17")!)),
    );
    assert.ok(cl2?.diagnostics.some((d) => d.code === "MUTATION_VIOLATION"));

    const cl3 = constraintSection(
      analyzeConstraint(loadFixture(CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-20")!)),
    );
    assert.ok(cl3 && cl3.unknowns.length >= 1);

    const cl4 = constraintSection(
      analyzeConstraint(loadFixture(CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-14")!)),
    );
    assert.ok(cl4 && cl4.unknowns.length >= 1);
    assert.equal(cl4.diagnostics.some((d) => d.code === "REFINEMENT_VIOLATION"), false);

    const cl6 = constraintSection(
      analyzeConstraint(loadFixture(CONSTRAINT_CORPUS.find((entry) => entry.id === "cl-05")!)),
    );
    assert.equal(cl6?.diagnostics.length, 0);
    assert.equal(cl6?.unknowns.length, 0);
  });
});
