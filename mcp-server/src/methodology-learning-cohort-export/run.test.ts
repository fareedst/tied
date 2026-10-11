/**
 * [TEST-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT]
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

import { MANIFEST_SCHEMA_VERSION, EXPORT_SCHEMA_VERSION } from "./constants.js";
import { parseCohortExportManifestObject } from "./manifest.js";
import { runMethodologyLearningCohortExport } from "./run.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const fixtureDir = path.join(repoRoot, "working/evidence-chain");

function writeExperimentsStore(dir: string, experimentId: string): void {
  const tiedProject = path.join(dir, "tied-project");
  fs.mkdirSync(tiedProject, { recursive: true });
  const record = {
    schema_version: "methodology-learning-experiment.v1",
    experiment_id: experimentId,
    production_system_surface: "checklist_step",
    methodology_hypothesis: "cohort export dogfood",
    proof_boundary: "structural only",
    privacy_tier: "shareable_hashed",
    methodology_baseline: { note: "fixture" },
  };
  fs.writeFileSync(
    path.join(tiedProject, "methodology-experiments.yaml"),
    yaml.dump({ experiments: [record] }),
    "utf8",
  );
}

function baseManifest(experimentId: string, profilePath: string) {
  return {
    schema_version: MANIFEST_SCHEMA_VERSION,
    privacy_tier: "shareable_hashed",
    policy: {
      redaction_owner: "sponsor",
      expiry: "2027-10-10",
      pilot: "stdd",
    },
    report_mode: "partial",
    report_version: "v1",
    experiments: [{ experiment_id: experimentId, profile_paths: [profilePath] }],
  };
}

describe("RUN_METHODOLOGY_LEARNING_COHORT_EXPORT [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]", () => {
  it("rejects operator_local experiment privacy tier [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mlce-policy-"));
    writeExperimentsStore(dir, "mle-local");
    const tiedProject = path.join(dir, "tied-project");
    const raw = yaml.load(fs.readFileSync(path.join(tiedProject, "methodology-experiments.yaml"), "utf8")) as {
      experiments: Array<Record<string, unknown>>;
    };
    raw.experiments[0].privacy_tier = "operator_local";
    fs.writeFileSync(path.join(tiedProject, "methodology-experiments.yaml"), yaml.dump(raw), "utf8");

    const profile = "example-profile.json";
    fs.copyFileSync(path.join(fixtureDir, "example-profile.json"), path.join(dir, profile));

    const result = runMethodologyLearningCohortExport({
      manifest: baseManifest("mle-local", profile),
      yamlOut: path.join(dir, "out.yaml"),
      basePath: tiedProject,
      cwd: dir,
      projectRoot: dir,
      now: "2026-10-10T12:00:00.000Z",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.diagnostics.some((d) => d.code === "privacy_tier_not_exportable"));
  });

  it("emits shareable export for shareable_hashed experiment and redacts project_id [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mlce-ok-"));
    const experimentId = "mle-export-demo";
    writeExperimentsStore(dir, experimentId);
    const profile = "example-profile.json";
    fs.copyFileSync(path.join(fixtureDir, "example-profile.json"), path.join(dir, profile));

    const yamlOut = path.join(dir, "cohort-export.yaml");
    const result = runMethodologyLearningCohortExport({
      manifest: baseManifest(experimentId, profile),
      yamlOut,
      basePath: path.join(dir, "tied-project"),
      cwd: dir,
      projectRoot: dir,
      now: "2026-10-10T12:00:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.export.schema_version, EXPORT_SCHEMA_VERSION);
    const serialized = fs.readFileSync(yamlOut, "utf8");
    assert.ok(!serialized.includes("/Users/"));
    const reportInputs = result.export.evidence_chain_report.inputs ?? [];
    assert.ok(reportInputs.length > 0);
    for (const row of reportInputs) {
      assert.match(String(row.project_id), /^[a-f0-9]{16}$/);
    }
  });

  it("parse manifest rejects path escape [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]", () => {
    const parsed = parseCohortExportManifestObject(
      baseManifest("mle-x", "../etc/passwd"),
    );
    assert.equal(parsed.ok, false);
  });
});
