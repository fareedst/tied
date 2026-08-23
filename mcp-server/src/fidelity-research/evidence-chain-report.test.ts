/**
 * [TEST-EVIDENCE_CHAIN_REPORT] [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
 * How: Lock count-only cohort aggregation, mode exits, path privacy, and forbidden-score rejection before production code.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

import {
  EVIDENCE_CHAIN_REPORT_SCHEMA,
  generateEvidenceChainStatisticsReport,
  loadReportInputManifest,
  type EvidenceChainStatisticsReport,
  type NamedStatistic,
} from "./evidence-chain-report.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const fixtureDir = path.join(repoRoot, "working/evidence-chain");

const FIXED_NOW = "2026-08-22T18:00:00.000Z";

function writeManifest(dir: string, body: string): string {
  const manifestPath = path.join(dir, "report-inputs.yaml");
  fs.writeFileSync(manifestPath, body, "utf8");
  return manifestPath;
}

function copyFixture(dir: string, name: string, destName = name): string {
  const dest = path.join(dir, destName);
  fs.copyFileSync(path.join(fixtureDir, name), dest);
  return dest;
}

function mutateJson(filePath: string, mutator: (value: Record<string, unknown>) => void): void {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
  mutator(parsed);
  fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
}

function statisticNames(report: EvidenceChainStatisticsReport): string[] {
  const names = (report.statistics ?? []).map((row) => row.name);
  for (const cohort of report.cohorts) {
    names.push(...cohort.statistics.map((row) => row.name));
  }
  return names;
}

function findStats(report: EvidenceChainStatisticsReport, name: string): NamedStatistic[] {
  const rows = [...(report.statistics ?? []), ...report.cohorts.flatMap((cohort) => cohort.statistics)];
  return rows.filter((row) => row.name === name);
}

function generateIn(dir: string, options: {
  manifest: string;
  modeOverride?: "strict" | "partial";
  includeAbsolute?: boolean;
}) {
  return generateEvidenceChainStatisticsReport({
    inputsPath: options.manifest,
    yamlOut: path.join(dir, "report.yaml"),
    markdownOut: path.join(dir, "report.md"),
    modeOverride: options.modeOverride,
    now: FIXED_NOW,
    cwd: dir,
    projectRoot: dir,
  });
}

describe("GENERATE_EVIDENCE_CHAIN_REPORT [REQ-EVIDENCE_CHAIN_REPORT]", () => {
  it("aggregates one client profile into one client cohort [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-one-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: example-profile.json",
        "    client_alias: example-manual",
        "",
      ].join("\n"),
    );

    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.schema_version, EVIDENCE_CHAIN_REPORT_SCHEMA);
    assert.equal(result.report.generated_at, FIXED_NOW);
    assert.equal(result.report.mode, "strict");
    assert.equal(result.report.include_absolute_paths, false);
    assert.equal(result.report.cohorts.length, 1);
    assert.equal(result.report.cohorts[0]?.compatibility_key, "evidence-chain-profile.v1|integrated");
    const profileCount = findStats(result.report, "cohort_profile_count")[0];
    assert.equal(profileCount?.numerator, 1);
    assert.equal(profileCount?.denominator, 1);
    assert.equal(profileCount?.status, "observed");
    assert.ok(profileCount?.source);
    assert.ok(profileCount?.method);
    assert.ok(profileCount?.proof_boundary);
    const unique = findStats(result.report, "unique_project_id_count")[0];
    assert.equal(unique?.numerator, 1);
    assert.equal(result.report.inputs[0]?.project_id, "manual-example");
    assert.equal(result.report.inputs[0]?.client_alias, "example-manual");
    assert.equal(result.report.inputs[0]?.artifact_ref, "example-profile.json");
  });

  it("groups many compatible clients and stays independent of input order [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-many-"));
    copyFixture(dir, "example-profile.json");
    copyFixture(dir, "stdd-integrated.json");
    const first = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: stdd-integrated.json",
        "    client_alias: stdd",
        "  - profile_path: example-profile.json",
        "    client_alias: example-manual",
        "",
      ].join("\n"),
    );
    const second = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: example-profile.json",
        "    client_alias: example-manual",
        "  - profile_path: stdd-integrated.json",
        "    client_alias: stdd",
        "",
      ].join("\n"),
    );
    const a = generateEvidenceChainStatisticsReport({
      inputsPath: first,
      yamlOut: path.join(dir, "a.yaml"),
      markdownOut: path.join(dir, "a.md"),
      now: FIXED_NOW,
      cwd: dir,
      projectRoot: dir,
    });
    const b = generateEvidenceChainStatisticsReport({
      inputsPath: second,
      yamlOut: path.join(dir, "b.yaml"),
      markdownOut: path.join(dir, "b.md"),
      now: FIXED_NOW,
      cwd: dir,
      projectRoot: dir,
    });
    assert.equal(a.ok && b.ok, true);
    if (!a.ok || !b.ok) return;
    assert.equal(a.report.cohorts.length, 1);
    assert.equal(findStats(a.report, "cohort_profile_count")[0]?.numerator, 2);
    assert.equal(findStats(a.report, "unique_project_id_count")[0]?.numerator, 2);
    const yamlA = fs.readFileSync(path.join(dir, "a.yaml"), "utf8");
    const yamlB = fs.readFileSync(path.join(dir, "b.yaml"), "utf8");
    assert.equal(yamlA, yamlB);
    assert.equal(fs.readFileSync(path.join(dir, "a.md"), "utf8"), fs.readFileSync(path.join(dir, "b.md"), "utf8"));
    assert.deepEqual(
      a.report.inputs.map((row) => row.project_id),
      [...a.report.inputs.map((row) => row.project_id)].sort((left, right) => left.localeCompare(right)),
    );
  });

  it("partitions incompatible profile_depth values into separate client cohorts [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-cohort-"));
    copyFixture(dir, "stdd-integrated.json");
    copyFixture(dir, "stdd-human_research.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: stdd-integrated.json",
        "  - profile_path: stdd-human_research.json",
        "",
      ].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.cohorts.length, 2);
    const keys = result.report.cohorts.map((cohort) => cohort.compatibility_key).sort();
    assert.deepEqual(keys, [
      "evidence-chain-profile.v1|human_research",
      "evidence-chain-profile.v1|integrated",
    ]);
    for (const cohort of result.report.cohorts) {
      assert.equal(findStats({ ...result.report, cohorts: [cohort], statistics: [] }, "cohort_profile_count")[0]?.numerator, 1);
    }
    const names = statisticNames(result.report);
    assert.equal(names.includes("maturity"), false);
    assert.ok(!JSON.stringify(result.report).includes("universal_score"));
  });

  it("does not convert not_measured evidence to zero [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-zero-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const graphStatus = findStats(result.report, "measurement_status_count").find(
      (row) => row.field_path === "evidence_chain.graph" && row.counted_status === "not_measured",
    );
    assert.ok(graphStatus);
    assert.equal(graphStatus?.numerator, 1);
    assert.equal(graphStatus?.status, "observed");
    for (const row of [...(result.report.statistics ?? []), ...result.report.cohorts.flatMap((c) => c.statistics)]) {
      assert.notEqual(row.name, "graph_value_sum");
      assert.ok(!("average" in row));
    }
    const serialized = JSON.stringify(result.report);
    assert.equal(serialized.includes('"maturity"'), false);
    assert.match(serialized, /not_measured/);
  });

  it("rejects malformed profiles and forbidden score fields [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-bad-"));
    fs.writeFileSync(path.join(dir, "malformed.json"), "{not-json", "utf8");
    copyFixture(dir, "example-profile.json", "scored.json");
    mutateJson(path.join(dir, "scored.json"), (value) => {
      value.maturity = 9;
    });
    const malformedManifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: malformed.json", ""].join("\n"),
    );
    const malformed = generateIn(dir, { manifest: malformedManifest });
    assert.equal(malformed.ok, false);
    if (malformed.ok) return;
    assert.equal(malformed.error, "MalformedProfile");
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);

    const scoredManifest = path.join(dir, "scored-inputs.yaml");
    fs.writeFileSync(
      scoredManifest,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: scored.json", ""].join("\n"),
      "utf8",
    );
    const scored = generateEvidenceChainStatisticsReport({
      inputsPath: scoredManifest,
      yamlOut: path.join(dir, "scored.yaml"),
      markdownOut: path.join(dir, "scored.md"),
      now: FIXED_NOW,
      cwd: dir,
      projectRoot: dir,
    });
    assert.equal(scored.ok, false);
    if (scored.ok) return;
    assert.equal(scored.error, "ForbiddenField");
    assert.equal(fs.existsSync(path.join(dir, "scored.yaml")), false);
  });

  it("rejects duplicate project_id commit profile_depth scope_hash [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-dup-"));
    copyFixture(dir, "example-profile.json", "one.json");
    copyFixture(dir, "example-profile.json", "two.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: one.json",
        "  - profile_path: two.json",
        "",
      ].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "DuplicateInput");
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);
  });

  it("keeps artifact_ref as basename unless include_absolute_paths is true [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-path-"));
    copyFixture(dir, "example-profile.json");
    const hidden = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "include_absolute_paths: false",
        "inputs:",
        "  - profile_path: example-profile.json",
        "",
      ].join("\n"),
    );
    const hiddenResult = generateIn(dir, { manifest: hidden });
    assert.equal(hiddenResult.ok, true);
    if (!hiddenResult.ok) return;
    assert.equal(hiddenResult.report.inputs[0]?.artifact_ref, "example-profile.json");
    assert.equal(JSON.stringify(hiddenResult.report).includes(dir), false);

    const shownManifest = path.join(dir, "abs.yaml");
    fs.writeFileSync(
      shownManifest,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "include_absolute_paths: true",
        "inputs:",
        "  - profile_path: example-profile.json",
        "",
      ].join("\n"),
      "utf8",
    );
    const shown = generateEvidenceChainStatisticsReport({
      inputsPath: shownManifest,
      yamlOut: path.join(dir, "abs-report.yaml"),
      markdownOut: path.join(dir, "abs-report.md"),
      now: FIXED_NOW,
      cwd: dir,
      projectRoot: dir,
    });
    assert.equal(shown.ok, true);
    if (!shown.ok) return;
    assert.equal(shown.report.inputs[0]?.artifact_ref, path.resolve(dir, "example-profile.json"));
  });

  it("preserves proof-boundary partition counts [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-proof-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const partitions = findStats(result.report, "proof_boundary_partition_count");
    const trace = partitions.find((row) => row.partition === "traceability_structure");
    const human = partitions.find((row) => row.partition === "human_decision");
    assert.equal(trace?.numerator, 1);
    assert.equal(human?.numerator, 1);
    assert.ok(trace?.proof_boundary);
  });

  it("writes nothing in strict mode on the first rejection [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-strict-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "mode: strict",
        "inputs:",
        "  - profile_path: example-profile.json",
        "  - profile_path: missing.json",
        "",
      ].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "MissingArtifact");
    assert.equal(result.exit_code, 2);
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);
    assert.equal(fs.existsSync(path.join(dir, "report.md")), false);
  });

  it("excludes rejected inputs in partial mode and counts them [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-partial-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "mode: partial",
        "inputs:",
        "  - profile_path: example-profile.json",
        "  - profile_path: missing.json",
        "",
      ].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.excluded_inputs.length, 1);
    const excluded = findStats(result.report, "excluded_input_count")[0];
    const errors = findStats(result.report, "validation_error_count")[0];
    assert.equal(excluded?.numerator, 1);
    assert.equal(errors?.numerator, 1);
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), true);
  });

  it("lets CLI --mode win over the report input manifest [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-mode-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "mode: partial",
        "inputs:",
        "  - profile_path: missing.json",
        "",
      ].join("\n"),
    );
    const result = generateIn(dir, { manifest, modeOverride: "strict" });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.exit_code, 2);
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);
  });

  it("rejects intent-directory output paths [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-intent-"));
    const tied = path.join(dir, "tied");
    fs.mkdirSync(path.join(tied, "requirements"), { recursive: true });
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
    );
    const result = generateEvidenceChainStatisticsReport({
      inputsPath: manifest,
      yamlOut: path.join(tied, "requirements", "report.yaml"),
      markdownOut: path.join(dir, "report.md"),
      now: FIXED_NOW,
      cwd: dir,
      projectRoot: dir,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "ForbiddenOutputPath");
  });

  it("rejects an invalid report input manifest [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-manifest-"));
    const manifest = writeManifest(dir, "schema_version: not-a-report\ninputs: []\n");
    assert.throws(
      () => loadReportInputManifest(manifest),
      /InvalidManifest/,
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "InvalidManifest");
  });

  it("does not mutate source profile artifacts [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-ro-"));
    const profile = copyFixture(dir, "example-profile.json");
    const before = fs.readFileSync(profile, "utf8");
    const manifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    assert.equal(fs.readFileSync(profile, "utf8"), before);
  });

  it("projects YAML values only into Markdown [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-md-"));
    copyFixture(dir, "example-profile.json");
    const manifest = writeManifest(
      dir,
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
    );
    const result = generateIn(dir, { manifest });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const markdown = fs.readFileSync(path.join(dir, "report.md"), "utf8");
    const loaded = yaml.load(fs.readFileSync(path.join(dir, "report.yaml"), "utf8")) as EvidenceChainStatisticsReport;
    assert.equal(loaded.generated_at, result.report.generated_at);
    assert.match(markdown, new RegExp(FIXED_NOW.replaceAll(":", "\\:")));
    assert.match(markdown, /strict/);
    assert.match(markdown, /cohort_profile_count/);
    assert.doesNotMatch(markdown, /maturity_score/);
    assert.doesNotMatch(markdown, /universal_score/);
  });
});
