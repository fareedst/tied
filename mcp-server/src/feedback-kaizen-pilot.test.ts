/**
 * [REQ-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN-FEEDBACK-PILOT] [IMPL-KAIZEN-FEEDBACK-PILOT]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { getFeedbackPath } from "./feedback.js";
import { runKaizenFeedbackPilot, type PilotSpec } from "./feedback-kaizen-pilot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "..", "test", "fixtures", "kaizen-feedback-pilot");

const FIXTURE_NAMES = [
  "named_metrics_denominators",
  "stop_criteria_triggered_privacy",
  "stop_criteria_clear",
  "transport_criteria_not_applicable",
  "incompatible_cohort_size",
  "denominator_mismatch_stop",
  "promotion_rule_on_report",
] as const;

function loadFixtureDir(name: string): {
  feedback: { entries: unknown[] };
  params: {
    spec: PilotSpec;
    pilot_incident_signals?: string[];
    denominator_manifest?: PilotSpec["denominator_manifest"];
    require_manifest_ref?: boolean;
  };
  expectedReport?: Record<string, unknown>;
  expectedError?: { ok: boolean; error: string };
} {
  const dir = path.join(FIXTURE_ROOT, name);
  const feedback = JSON.parse(fs.readFileSync(path.join(dir, "feedback.json"), "utf8")) as {
    entries: unknown[];
  };
  const params = JSON.parse(fs.readFileSync(path.join(dir, "params.json"), "utf8")) as {
    spec: PilotSpec;
    pilot_incident_signals?: string[];
    denominator_manifest?: PilotSpec["denominator_manifest"];
    require_manifest_ref?: boolean;
  };
  const expectedReportPath = path.join(dir, "expected-report.json");
  const expectedErrorPath = path.join(dir, "expected-error.json");
  return {
    feedback,
    params,
    ...(fs.existsSync(expectedReportPath)
      ? { expectedReport: JSON.parse(fs.readFileSync(expectedReportPath, "utf8")) as Record<string, unknown> }
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
  const dir = fs.mkdtempSync(path.join(path.dirname(FIXTURE_ROOT), "kaizen-pilot-"));
  writeFeedbackYaml(dir, entries);
  return dir;
}

function specFromFixture(params: ReturnType<typeof loadFixtureDir>["params"]): PilotSpec {
  return {
    ...params.spec,
    ...(params.denominator_manifest ? { denominator_manifest: params.denominator_manifest } : {}),
    ...(params.require_manifest_ref ? { require_manifest_ref: params.require_manifest_ref } : {}),
  };
}

function assertPartialReport(actual: Record<string, unknown>, expected: Record<string, unknown>): void {
  if (expected.schema_version) assert.equal(actual.schema_version, expected.schema_version);
  if (expected.promotion_rule) assert.equal(actual.promotion_rule, expected.promotion_rule);
  if (expected.proof_boundary) assert.equal(actual.proof_boundary, expected.proof_boundary);
  if (expected.cohort_id) assert.equal(actual.cohort_id, expected.cohort_id);
  if (expected.entry_count !== undefined) assert.equal(actual.entry_count, expected.entry_count);
  if (expected.metrics) {
    assert.deepEqual(actual.metrics, expected.metrics);
  }
  if (expected.stop_criteria) {
    const sc = expected.stop_criteria as Record<string, unknown>;
    const actualSc = actual.stop_criteria as Record<string, unknown>;
    if (sc.any_triggered !== undefined) assert.equal(actualSc.any_triggered, sc.any_triggered);
    if (sc.halted !== undefined) assert.equal(actualSc.halted, sc.halted);
    if (sc.criteria) {
      const expectedRows = sc.criteria as Array<{ criterion_id: string }>;
      const actualRows = actualSc.criteria as Array<Record<string, unknown>>;
      for (const row of expectedRows) {
        const match = actualRows.find((r) => r.criterion_id === row.criterion_id);
        assert.ok(match, `missing criterion ${row.criterion_id}`);
        assert.deepEqual(match, row);
      }
    }
  }
}

function fileSha256(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe("feedback-kaizen-pilot golden fixtures [REQ-KAIZEN-FEEDBACK-PILOT]", () => {
  for (const name of FIXTURE_NAMES) {
    it(`fixture: ${name}`, () => {
      const fx = loadFixtureDir(name);
      const projectRoot = tmpProject(fx.feedback.entries);
      try {
        const result = runKaizenFeedbackPilot({
          projectRoot,
          spec: specFromFixture(fx.params),
          pilot_incident_signals: fx.params.pilot_incident_signals ?? [],
        });
        if (fx.expectedError) {
          assert.equal(result.ok, fx.expectedError.ok);
          assert.equal(result.error, fx.expectedError.error);
          if (fx.expectedReport && result.report) {
            assertPartialReport(result.report as unknown as Record<string, unknown>, fx.expectedReport);
          }
          return;
        }
        assert.equal(result.ok, true, result.error ?? "expected ok");
        assert.ok(result.report);
        assertPartialReport(result.report as unknown as Record<string, unknown>, fx.expectedReport ?? {});
      } finally {
        fs.rmSync(projectRoot, { recursive: true, force: true });
      }
    });
  }

  it("fixture: store_immutability — feedback.yaml unchanged after pilot run", () => {
    const fx = loadFixtureDir("named_metrics_denominators");
    const projectRoot = tmpProject(fx.feedback.entries);
    try {
      const feedbackPath = getFeedbackPath(projectRoot);
      const before = fileSha256(feedbackPath);
      const result = runKaizenFeedbackPilot({
        projectRoot,
        spec: specFromFixture(fx.params),
      });
      assert.equal(result.ok, true);
      assert.equal(fileSha256(feedbackPath), before);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
