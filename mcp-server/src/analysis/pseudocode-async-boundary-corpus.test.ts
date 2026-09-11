import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { analyzeEssencePseudocode } from "./pseudocode-analyzer.js";
import { buildCfg } from "./pseudocode-cfg.js";
import { DEFAULT_BUDGETS } from "./pseudocode-ir.js";
import { parsePseudocodeToIr } from "./pseudocode-parser.js";
import {
  ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT,
  runAsyncBoundaryAnalysis,
  type AsyncBoundaryDiagnosticCode,
  type AsyncBoundarySection,
} from "./pseudocode-async-boundary.js";

const analysisRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "analysis");
const fixtureDir = path.join(analysisRoot, "fixtures", "async-boundary");
const manifestPath = path.join(fixtureDir, "fixture-manifest.json");

type FixtureEntry = {
  id: string;
  file: string;
  diagnostic?: AsyncBoundaryDiagnosticCode;
  polarity?: "positive" | "negative";
  forbidDiagnostic?: AsyncBoundaryDiagnosticCode;
  forbidAllAsyncDiagnostics?: boolean;
  requireUnknown?: boolean;
  gateModeError?: AsyncBoundaryDiagnosticCode;
  gateModePass?: boolean;
};

type Manifest = {
  fixtures: FixtureEntry[];
  proof_boundary: string;
};

const ALL_ASYNC_CODES: AsyncBoundaryDiagnosticCode[] = [
  "ASYNC_EFFECTS_WITHOUT_BOUNDARY",
  "AWAIT_NON_PROMISE_OUTPUT",
  "MISSING_TIMEOUT_FAILURE_MODE",
  "SEQUENCING_UNDEFINED_SHARED_DATA",
  "CALL_ACROSS_ASYNC_BOUNDARY",
  "RETRY_WITHOUT_IDEMPOTENCY",
  "OPEN_WAIT_WITHOUT_TERMINATION",
];

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
const CORPUS = manifest.fixtures;

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(fixtureDir, name), "utf8");
}

function analyzeFixture(source: string): AsyncBoundarySection {
  const parsed = parsePseudocodeToIr(source);
  assert.equal(parsed.ok, true, "fixture must parse");
  if (!parsed.ok) throw new Error("parse failed");
  const cfg = buildCfg(parsed.program, DEFAULT_BUDGETS);
  return runAsyncBoundaryAnalysis(parsed.program, cfg.section, { source }).section;
}

function analyzeGateFixture(source: string, asyncGateErrors: boolean) {
  return analyzeEssencePseudocode({
    token: "IMPL-ASYNC_BOUNDARY_ANALYZER",
    pseudocode: source,
    gate_mode: true,
    async_boundary: true,
    async_gate_errors: asyncGateErrors,
  });
}

function assertNoRaceClaims(text: string, label: string): void {
  const forbidden = /race[- ]free|deadlock[- ]free|livelock[- ]free|happens-before proof|fairness guarantee/i;
  assert.equal(forbidden.test(text), false, `${label} must not claim race/deadlock/liveness proof`);
}

describe("pseudocode-async-boundary corpus [REQ-ASYNC_BOUNDARY_ANALYSIS]", () => {
  it("loads manifest and >=20 labeled fixtures", () => {
    const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith(".pseudocode.md"));
    assert.ok(files.length >= 20);
    assert.ok(CORPUS.length >= 20);
    assert.equal(files.length, CORPUS.length);
    for (const entry of CORPUS) {
      assert.ok(files.includes(entry.file), `missing fixture ${entry.file}`);
    }
  });

  it("manifest proof boundary is structural-only", () => {
    assert.equal(manifest.proof_boundary, ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT);
    assertNoRaceClaims(manifest.proof_boundary, "manifest");
  });

  for (const entry of CORPUS) {
    it(`case ${entry.id} meets labeled expectation`, () => {
      const section = analyzeFixture(loadFixture(entry.file));

      if (entry.diagnostic && entry.polarity === "positive") {
        assert.ok(
          section.diagnostics.some((d) => d.code === entry.diagnostic),
          `case ${entry.id}: expected ${entry.diagnostic}`,
        );
      }

      if (entry.forbidDiagnostic) {
        assert.equal(
          section.diagnostics.some((d) => d.code === entry.forbidDiagnostic),
          false,
          `case ${entry.id}: must not emit ${entry.forbidDiagnostic}`,
        );
      }

      if (entry.forbidAllAsyncDiagnostics) {
        assert.equal(
          section.diagnostics.some((d) => ALL_ASYNC_CODES.includes(d.code)),
          false,
          `case ${entry.id}: must not emit async boundary diagnostics`,
        );
      }

      if (entry.requireUnknown) {
        assert.ok(section.unknowns.length >= 1, `case ${entry.id}: expected unknown`);
        assert.ok(
          section.unknowns.every((u) => u.proof_boundary.includes("structure and type consistency")),
          `case ${entry.id}: unknown proof_boundary populated`,
        );
      }
    });
  }

  it("every diagnostic code has positive and negative corpus coverage", () => {
    for (const code of ALL_ASYNC_CODES) {
      const positive = CORPUS.some(
        (entry) => entry.diagnostic === code && entry.polarity === "positive",
      );
      const negative = CORPUS.some(
        (entry) => entry.forbidDiagnostic === code || (entry.gateModePass && code !== "ASYNC_EFFECTS_WITHOUT_BOUNDARY"),
      );
      assert.ok(positive, `${code} missing positive fixture`);
      assert.ok(
        negative || CORPUS.some((entry) => entry.forbidDiagnostic === code),
        `${code} missing negative fixture`,
      );
    }
  });

  it("unknown/truncated coverage exists for inter-procedural checks", () => {
    assert.ok(CORPUS.some((entry) => entry.requireUnknown));
  });

  for (const entry of CORPUS.filter((item) => item.gateModeError || item.gateModePass)) {
    it(`gate_mode case ${entry.id} async_gate_errors behavior`, () => {
      const source = loadFixture(entry.file);
      const warningsOnly = analyzeGateFixture(source, false);
      if (!("schema_version" in warningsOnly)) throw new Error("expected report");
      assert.equal(warningsOnly.ok, true, `case ${entry.id}: warnings-only must pass gate`);

      const promoted = analyzeGateFixture(source, true);
      if (!("schema_version" in promoted)) throw new Error("expected report");
      assert.equal(promoted.gate_mode_applied, true);

      if (entry.gateModePass) {
        assert.equal(promoted.ok, true, `case ${entry.id}: must pass gate under async_gate_errors`);
        return;
      }

      assert.equal(promoted.ok, false, `case ${entry.id}: must fail gate under async_gate_errors`);
      assert.ok(
        promoted.diagnostics.some(
          (d) => d.severity === "error" && d.code === entry.gateModeError,
        ),
        `case ${entry.id}: expected gate error ${entry.gateModeError}`,
      );
    });
  }

  it("async_boundary sections serialize deterministically", () => {
    for (const entry of CORPUS) {
      const source = loadFixture(entry.file);
      const first = JSON.stringify(analyzeFixture(source));
      const second = JSON.stringify(analyzeFixture(source.replace(/\n/g, "\r\n")));
      assert.equal(first, second, `case ${entry.id}: byte-stable async_boundary section`);
    }
  });
});
