/**
 * [REQ-KAIZEN-FEEDBACK-ANALYSIS] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [IMPL-KAIZEN_FEEDBACK_ANALYSIS]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { getFeedbackPath } from "./feedback.js";
import { buildFeedbackDigest } from "./feedback-analysis.js";
import type { BuildFeedbackDigestParams, FeedbackAnalysisDigestV1 } from "./feedback-analysis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "..", "test", "fixtures", "kaizen-feedback-analysis");

const FIXTURE_NAMES = [
  "recurrence_duplicate_groups",
  "denominator_mismatch",
  "missing_evidence_manifest",
  "incompatible_cohorts",
  "empty_analysis_window",
  "identical_rerun_identity",
] as const;

function loadFixtureDir(name: string): {
  feedback: { entries: unknown[] };
  params: Record<string, unknown>;
  expectedDigest?: Record<string, unknown>;
  expectedError?: { ok: boolean; error: string };
} {
  const dir = path.join(FIXTURE_ROOT, name);
  const feedback = JSON.parse(fs.readFileSync(path.join(dir, "feedback.json"), "utf8")) as {
    entries: unknown[];
  };
  const params = JSON.parse(fs.readFileSync(path.join(dir, "params.json"), "utf8")) as Record<string, unknown>;
  const expectedDigestPath = path.join(dir, "expected-digest.json");
  const expectedErrorPath = path.join(dir, "expected-error.json");
  return {
    feedback,
    params,
    ...(fs.existsSync(expectedDigestPath)
      ? { expectedDigest: JSON.parse(fs.readFileSync(expectedDigestPath, "utf8")) as Record<string, unknown> }
      : {}),
    ...(fs.existsSync(expectedErrorPath)
      ? { expectedError: JSON.parse(fs.readFileSync(expectedErrorPath, "utf8")) as { ok: boolean; error: string } }
      : {}),
  };
}

function writeFeedbackYaml(basePath: string, entries: unknown[]): void {
  fs.mkdirSync(basePath, { recursive: true });
  fs.writeFileSync(getFeedbackPath(basePath), yaml.dump({ entries }, { lineWidth: -1, noRefs: true }), "utf8");
}

function tmpProject(entries: unknown[]): string {
  const dir = fs.mkdtempSync(path.join(path.dirname(FIXTURE_ROOT), "kaizen-analysis-"));
  writeFeedbackYaml(dir, entries);
  return dir;
}

function paramsFromFixture(raw: Record<string, unknown>, projectRoot: string): BuildFeedbackDigestParams {
  return {
    projectRoot,
    ...(raw.window ? { window: raw.window as BuildFeedbackDigestParams["window"] } : {}),
    cohort: raw.cohort as BuildFeedbackDigestParams["cohort"],
    ...(raw.denominator_manifest
      ? { denominator_manifest: raw.denominator_manifest as BuildFeedbackDigestParams["denominator_manifest"] }
      : {}),
    ...(raw.require_manifest_ref ? { require_manifest_ref: Boolean(raw.require_manifest_ref) } : {}),
  };
}

function assertPartialDigest(actual: FeedbackAnalysisDigestV1, expected: Record<string, unknown>): void {
  if (expected.schema_version) assert.equal(actual.schema_version, expected.schema_version);
  if (expected.inputs) {
    const inputs = expected.inputs as Record<string, number>;
    for (const [key, value] of Object.entries(inputs)) {
      assert.equal((actual.inputs as Record<string, number>)[key], value, `inputs.${key}`);
    }
  }
  if (expected.observations) {
    const obs = expected.observations as {
      by_kind?: Record<string, number>;
      recurrence?: Array<{ duplicate_group: string; count: number }>;
    };
    if (obs.by_kind) assert.deepEqual(actual.observations.by_kind, obs.by_kind);
    if (obs.recurrence) {
      assert.deepEqual(actual.observations.recurrence, obs.recurrence);
    }
  }
  if (expected.impact) {
    const impact = expected.impact as Record<string, unknown>;
    for (const [key, value] of Object.entries(impact)) {
      assert.equal((actual.impact as Record<string, unknown>)[key], value, `impact.${key}`);
    }
  }
  if (expected.diagnostics) {
    assert.deepEqual(actual.diagnostics, expected.diagnostics);
  }
  if (expected.excluded) {
    assert.deepEqual(actual.excluded, expected.excluded);
  }
}

function fileSha256(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe("feedback-analysis golden fixtures [REQ-KAIZEN-FEEDBACK-ANALYSIS]", () => {
  for (const name of FIXTURE_NAMES) {
    it(`fixture: ${name}`, () => {
      const fx = loadFixtureDir(name);
      const projectRoot = tmpProject(fx.feedback.entries);
      try {
        const result = buildFeedbackDigest(paramsFromFixture(fx.params, projectRoot));
        if (fx.expectedError) {
          assert.equal(result.ok, fx.expectedError.ok);
          assert.equal(result.error, fx.expectedError.error);
          return;
        }
        assert.equal(result.ok, true, result.error ?? "expected ok");
        assert.ok(result.digest);
        assertPartialDigest(result.digest, fx.expectedDigest ?? {});
      } finally {
        fs.rmSync(projectRoot, { recursive: true, force: true });
      }
    });
  }

  it("fixture: identical_rerun_identity — stable projection_hash across two runs", () => {
    const fx = loadFixtureDir("identical_rerun_identity");
    const projectRoot = tmpProject(fx.feedback.entries);
    try {
      const params = paramsFromFixture(fx.params, projectRoot);
      const first = buildFeedbackDigest(params);
      const second = buildFeedbackDigest(params);
      assert.equal(first.ok, true);
      assert.equal(second.ok, true);
      assert.equal(first.projection_hash, second.projection_hash);
      assert.ok(first.projection_hash && first.projection_hash.length === 16);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it("store immutability — feedback.yaml unchanged after buildFeedbackDigest", () => {
    const fx = loadFixtureDir("recurrence_duplicate_groups");
    const projectRoot = tmpProject(fx.feedback.entries);
    try {
      const feedbackPath = getFeedbackPath(projectRoot);
      const before = fileSha256(feedbackPath);
      const result = buildFeedbackDigest(paramsFromFixture(fx.params, projectRoot));
      assert.equal(result.ok, true);
      const after = fileSha256(feedbackPath);
      assert.equal(before, after);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
