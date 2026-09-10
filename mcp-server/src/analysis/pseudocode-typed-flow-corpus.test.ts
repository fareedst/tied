import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildCfg } from "./pseudocode-cfg.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";
import { parsePseudocodeToIr, serializeIrProgram } from "./pseudocode-parser.js";
import {
  DEFAULT_TYPED_FLOW_BUDGETS,
  runTypedFlowAnalysis,
  type TypedDiagnosticCode,
  type TypedFlowSection,
} from "./pseudocode-typed-flow.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "typed-flow");
const legacyFixtureDir = path.join(analysisRoot, "fixtures", "pseudocode-analysis");

type CorpusExpectation = {
  id: string;
  file: string;
  definiteError?: TypedDiagnosticCode | TypedDiagnosticCode[];
  allowUnknownInstead?: boolean;
  requireUnknown?: boolean;
  forbidDefiniteError?: boolean;
  forbidDiagnostic?: TypedDiagnosticCode;
  f1bEntryCount?: number;
  f8LegacyCompare?: boolean;
};

const DEFINITE_ERROR_CODES: TypedDiagnosticCode[] = [
  "TYPE_MISMATCH",
  "NULL_FLOW",
  "SHAPE_MISMATCH",
  "CALL_TYPE_MISMATCH",
  "JOIN_INCOMPATIBLE",
];

const CORPUS: CorpusExpectation[] = [
  { id: "01", file: "corpus-df-01-scalar-type-mismatch.pseudocode.md", definiteError: "TYPE_MISMATCH" },
  {
    id: "02",
    file: "corpus-df-02-nullable-unguarded.pseudocode.md",
    definiteError: "NULL_FLOW",
    allowUnknownInstead: true,
  },
  { id: "03", file: "corpus-df-03-collection-shape-mismatch.pseudocode.md", definiteError: "SHAPE_MISMATCH" },
  { id: "04", file: "corpus-df-04-record-field-missing.pseudocode.md", definiteError: "SHAPE_MISMATCH" },
  { id: "05", file: "corpus-df-05-branch-join-incompatible.pseudocode.md", definiteError: "JOIN_INCOMPATIBLE" },
  { id: "06", file: "corpus-df-06-loop-mutation.pseudocode.md", forbidDefiniteError: true },
  { id: "07", file: "corpus-df-07-call-bad-args.pseudocode.md", definiteError: "CALL_TYPE_MISMATCH" },
  { id: "08", file: "corpus-df-08-immutable-mutation.pseudocode.md", forbidDefiniteError: true },
  { id: "09", file: "corpus-df-09-run-external.pseudocode.md", requireUnknown: true },
  { id: "10", file: "corpus-df-10-opaque-if-condition.pseudocode.md", requireUnknown: true },
  { id: "11", file: "corpus-df-11-aliasing.pseudocode.md", requireUnknown: true },
  { id: "12", file: "corpus-df-12-refinement-pre.pseudocode.md", requireUnknown: true },
  { id: "13", file: "corpus-df-13-mixed-contract.pseudocode.md", f1bEntryCount: 7 },
  { id: "14", file: "corpus-df-14-legacy-fixture-copy.pseudocode.md", f8LegacyCompare: true },
  {
    id: "15",
    file: "corpus-df-15-compatible-call.pseudocode.md",
    forbidDiagnostic: "CALL_TYPE_MISMATCH",
  },
  {
    id: "16",
    file: "corpus-df-16-guarded-nullable.pseudocode.md",
    forbidDiagnostic: "NULL_FLOW",
  },
  { id: "17", file: "corpus-df-17-multi-procedure-budget.pseudocode.md" },
];

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function analyzeFixture(source: string): { parsed: ReturnType<typeof parsePseudocodeToIr>; section: TypedFlowSection } {
  const parsed = parsePseudocodeToIr(source);
  assert.equal(parsed.ok, true, "fixture must parse");
  if (!parsed.ok) throw new Error("parse failed");
  const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
  const { section } = runTypedFlowAnalysis(parsed.program, cfg.section, DEFAULT_TYPED_FLOW_BUDGETS);
  return { parsed, section };
}

function serializeTypedSection(section: TypedFlowSection): string {
  return JSON.stringify(section);
}

function hasDefiniteError(section: TypedFlowSection): boolean {
  return section.diagnostics.some((d) => DEFINITE_ERROR_CODES.includes(d.code));
}

function hasExpectedDetection(section: TypedFlowSection, expectation: CorpusExpectation): boolean {
  if (!expectation.definiteError) return true;
  const expected = Array.isArray(expectation.definiteError)
    ? expectation.definiteError
    : [expectation.definiteError];
  const matched = expected.some((code) => section.diagnostics.some((d) => d.code === code));
  if (matched) return true;
  if (expectation.allowUnknownInstead) {
    return section.unknowns.some((u) => u.cause.length > 0);
  }
  return false;
}

describe("pseudocode-typed-flow corpus [REQ-PSEUDOCODE_TYPED_FLOW]", () => {
  it("loads all 17 labeled fixtures (F1)", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith(".pseudocode.md"));
    assert.equal(files.length, 17);
    assert.equal(CORPUS.length, 17);
    for (const entry of CORPUS) {
      assert.ok(files.includes(entry.file), `missing fixture ${entry.file}`);
      const { parsed } = analyzeFixture(loadFixture(entry.file));
      assert.ok(parsed.ok);
    }
  });

  for (const entry of CORPUS) {
    it(`case ${entry.id} meets labeled expectation`, () => {
      // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
      const { section } = analyzeFixture(loadFixture(entry.file));

      if (entry.definiteError) {
        assert.ok(
          hasExpectedDetection(section, entry),
          `case ${entry.id}: expected ${String(entry.definiteError)} or allowed unknown`,
        );
      }

      if (entry.forbidDefiniteError) {
        assert.equal(
          hasDefiniteError(section),
          false,
          `case ${entry.id}: must not emit definite-error diagnostics in pilot`,
        );
      }

      if (entry.requireUnknown) {
        assert.ok(section.unknowns.length >= 1, `case ${entry.id}: expected >=1 unknown`);
        assert.ok(
          section.unknowns.every((u) => u.cause.length > 0),
          `case ${entry.id}: unknown cause must be populated (F7)`,
        );
      }

      if (entry.forbidDiagnostic) {
        assert.equal(
          section.diagnostics.some((d) => d.code === entry.forbidDiagnostic),
          false,
          `case ${entry.id}: must not emit ${entry.forbidDiagnostic}`,
        );
      }

      if (entry.f1bEntryCount !== undefined) {
        const parsed = parsePseudocodeToIr(loadFixture(entry.file));
        assert.equal(parsed.ok, true);
        if (!parsed.ok) return;
        const proc = parsed.program.procedures.find((p) => p.name === "MIXED")!;
        assert.equal(proc.contract.entries?.length, entry.f1bEntryCount);
        assert.equal(proc.contract.values?.INPUT, "session description prose field");
      }

      if (entry.f8LegacyCompare) {
        const corpusSource = loadFixture(entry.file);
        const legacySource = fs.readFileSync(
          path.join(legacyFixtureDir, "minimal-branches.pseudocode.md"),
          "utf8",
        );
        const corpusParsed = parsePseudocodeToIr(corpusSource);
        const legacyParsed = parsePseudocodeToIr(legacySource);
        assert.equal(corpusParsed.ok, true);
        assert.equal(legacyParsed.ok, true);
        if (!corpusParsed.ok || !legacyParsed.ok) return;
        assert.equal(
          serializeIrProgram(corpusParsed.program),
          serializeIrProgram(legacyParsed.program),
          "case 14 must parse identically to minimal-branches (F8)",
        );
      }
    });
  }

  it("F7: cases 09-11 emit unknowns with populated cause", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    for (const id of ["09", "10", "11"]) {
      const entry = CORPUS.find((item) => item.id === id)!;
      const { section } = analyzeFixture(loadFixture(entry.file));
      assert.ok(section.unknowns.length >= 1, `case ${id}: expected unknown`);
      assert.ok(
        section.unknowns.every((u) => u.cause.length > 0),
        `case ${id}: unknown cause populated`,
      );
    }
  });

  it("F9: typed-flow sections serialize deterministically", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    for (const entry of CORPUS) {
      const source = loadFixture(entry.file);
      const first = serializeTypedSection(analyzeFixture(source).section);
      const second = serializeTypedSection(analyzeFixture(source.replace(/\n/g, "\r\n")).section);
      assert.equal(first, second, `case ${entry.id}: byte-stable typed-flow section`);
    }
  });

  it("F10: zero budget_exceeded on fixtures 01-17 at default budgets", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    for (const entry of CORPUS) {
      const { section } = analyzeFixture(loadFixture(entry.file));
      const budgetExceeded = section.unknowns.filter((u) => u.cause === "budget_exceeded");
      assert.deepEqual(
        budgetExceeded,
        [],
        `case ${entry.id}: expected zero budget_exceeded at DEFAULT_TYPED_FLOW_BUDGETS`,
      );
    }
  });

  it("F12: 100% recall on definite-error cases 01-05 and 07", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const recallCases = CORPUS.filter((entry) =>
      ["01", "02", "03", "04", "05", "07"].includes(entry.id),
    );
    const missed = recallCases.filter((entry) => !hasExpectedDetection(analyzeFixture(loadFixture(entry.file)).section, entry));
    assert.deepEqual(
      missed.map((entry) => entry.id),
      [],
      `F12 recall gaps on cases: ${missed.map((entry) => entry.id).join(", ")}`,
    );
  });

  it("F3/F6 positive controls: case 16 guarded nullable and case 15 compatible CALL", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const case16 = analyzeFixture(loadFixture(CORPUS.find((e) => e.id === "16")!.file)).section;
    assert.equal(
      case16.diagnostics.some((d) => d.code === "NULL_FLOW"),
      false,
      "case 16: guarded nullable must not emit NULL_FLOW (F3)",
    );

    const case15 = analyzeFixture(loadFixture(CORPUS.find((e) => e.id === "15")!.file)).section;
    assert.equal(
      case15.diagnostics.some((d) => d.code === "CALL_TYPE_MISMATCH"),
      false,
      "case 15: compatible CALL must not emit CALL_TYPE_MISMATCH (F6)",
    );
  });

  it("case 17 analyzes >=8 procedures without budget_exceeded", () => {
    // [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
    const { section } = analyzeFixture(loadFixture(CORPUS.find((e) => e.id === "17")!.file));
    assert.ok(section.procedures_analyzed >= 8);
    assert.equal(
      section.unknowns.some((u) => u.cause === "budget_exceeded"),
      false,
    );
  });
});
