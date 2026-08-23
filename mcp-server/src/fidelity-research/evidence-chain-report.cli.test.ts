/**
 * [TEST-EVIDENCE_CHAIN_REPORT] [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
 * How: Lock CLI flag mapping, exit codes, and non-mutation of intent YAML before wiring the entrypoint.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

import { runEvidenceChainReportCli } from "../cli/evidence-chain-report.js";
import type { EvidenceChainStatisticsReport } from "./evidence-chain-report.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const fixtureDir = path.join(repoRoot, "working/evidence-chain");

function setupDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecr-cli-"));
  fs.copyFileSync(path.join(fixtureDir, "example-profile.json"), path.join(dir, "example-profile.json"));
  return dir;
}

describe("RUN_EVIDENCE_CHAIN_REPORT_CLI [REQ-EVIDENCE_CHAIN_REPORT]", () => {
  it("writes agreeing YAML and Markdown and exits 0 [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.writeFileSync(
      path.join(dir, "inputs.yaml"),
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
      "utf8",
    );
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
      ],
      { cwd: dir, projectRoot: dir, now: "2026-08-22T18:00:00.000Z" },
    );
    assert.equal(code, 0);
    const report = yaml.load(fs.readFileSync(path.join(dir, "report.yaml"), "utf8")) as EvidenceChainStatisticsReport;
    const markdown = fs.readFileSync(path.join(dir, "report.md"), "utf8");
    assert.equal(report.schema_version, "evidence-chain-statistics-report.v1");
    assert.match(markdown, /2026-08-22T18:00:00.000Z/);
    assert.match(markdown, new RegExp(String(report.inputs.length)));
    assert.match(markdown, /cohort_profile_count/);
    assert.equal(markdown.includes("maturity_score"), false);
  });

  it("exits 2 in --mode strict and writes no outputs [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.writeFileSync(
      path.join(dir, "inputs.yaml"),
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "mode: partial",
        "inputs:",
        "  - profile_path: missing.json",
        "",
      ].join("\n"),
      "utf8",
    );
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
        "--mode",
        "strict",
      ],
      { cwd: dir, projectRoot: dir, now: "2026-08-22T18:00:00.000Z" },
    );
    assert.equal(code, 2);
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);
    assert.equal(fs.existsSync(path.join(dir, "report.md")), false);
  });

  it("exits 0 in --mode partial when one profile is accepted [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.writeFileSync(
      path.join(dir, "inputs.yaml"),
      [
        "schema_version: evidence-chain-report-inputs.v1",
        "inputs:",
        "  - profile_path: example-profile.json",
        "  - profile_path: missing.json",
        "",
      ].join("\n"),
      "utf8",
    );
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
        "--mode",
        "partial",
      ],
      { cwd: dir, projectRoot: dir, now: "2026-08-22T18:00:00.000Z" },
    );
    assert.equal(code, 0);
    const report = yaml.load(fs.readFileSync(path.join(dir, "report.yaml"), "utf8")) as EvidenceChainStatisticsReport;
    assert.equal(report.excluded_inputs.length, 1);
  });

  it("exits 1 when partial accepts zero profiles [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.writeFileSync(
      path.join(dir, "inputs.yaml"),
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: missing.json", ""].join("\n"),
      "utf8",
    );
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
        "--mode",
        "partial",
      ],
      { cwd: dir, projectRoot: dir, now: "2026-08-22T18:00:00.000Z" },
    );
    assert.equal(code, 1);
    assert.equal(fs.existsSync(path.join(dir, "report.yaml")), false);
  });

  it("exits 1 on usage errors and does not mutate project YAML [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    const tiedReq = path.join(dir, "tied", "requirements", "REQ-X.yaml");
    fs.mkdirSync(path.dirname(tiedReq), { recursive: true });
    fs.writeFileSync(tiedReq, "REQ-X:\n  name: stay\n", "utf8");
    const before = fs.readFileSync(tiedReq, "utf8");
    const code = runEvidenceChainReportCli(["--yaml-out", path.join(dir, "report.yaml")], {
      cwd: dir,
      projectRoot: dir,
    });
    assert.equal(code, 1);
    assert.equal(fs.readFileSync(tiedReq, "utf8"), before);
  });

  it("accepts --report-version v2 and emits v2 schema [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.copyFileSync(
      path.join(fixtureDir, "client-1787461685-bare.v1.json"),
      path.join(dir, "client-1787461685-bare.v1.json"),
    );
    fs.copyFileSync(
      path.join(fixtureDir, "client-1787461685-reprofile.v1.json"),
      path.join(dir, "client-1787461685-reprofile.v1.json"),
    );
    fs.copyFileSync(path.join(fixtureDir, "report-inputs-v2-golden.yaml"), path.join(dir, "inputs.yaml"));
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
        "--report-version",
        "v2",
      ],
      { cwd: dir, projectRoot: dir, now: "2026-08-22T18:00:00.000Z" },
    );
    assert.equal(code, 0);
    const report = yaml.load(fs.readFileSync(path.join(dir, "report.yaml"), "utf8")) as { schema_version: string; cohorts: Array<{ sub_cohorts: unknown[] }> };
    assert.equal(report.schema_version, "evidence-chain-statistics-report.v2");
    assert.equal(report.cohorts[0]?.sub_cohorts.length, 2);
  });

  it("exits 1 on invalid --report-version [REQ-EVIDENCE_CHAIN_REPORT]", () => {
    const dir = setupDir();
    fs.writeFileSync(
      path.join(dir, "inputs.yaml"),
      ["schema_version: evidence-chain-report-inputs.v1", "inputs:", "  - profile_path: example-profile.json", ""].join("\n"),
      "utf8",
    );
    const code = runEvidenceChainReportCli(
      [
        "--inputs",
        path.join(dir, "inputs.yaml"),
        "--yaml-out",
        path.join(dir, "report.yaml"),
        "--markdown-out",
        path.join(dir, "report.md"),
        "--report-version",
        "v3",
      ],
      { cwd: dir, projectRoot: dir },
    );
    assert.equal(code, 1);
  });
});
