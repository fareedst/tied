import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import type { FeedbackEntry } from "../feedback.js";
import { validateMethodologyLearningExperimentObject } from "../methodology-learning-experiment/validate.js";
import {
  buildExperimentDraftFromFeedbackEntries,
  runMethodologyKaizenExperimentBridge,
} from "./bridge.js";
import { computeProjectionHash, type FeedbackAnalysisDigestV1 } from "../feedback-analysis.js";

function eligibleEntry(overrides: Partial<FeedbackEntry> = {}): FeedbackEntry {
  return {
    id: "fb-w3-test-001",
    type: "methodology_improvement",
    title: "Gate blocks RED",
    description: "Hypothesis step skipped.",
    created_at: "2026-10-10T12:00:00Z",
    ...overrides,
  };
}

describe("methodology-kaizen-experiment-bridge", () => {
  it("builds draft with hypothesis and source_feedback_refs", () => {
    const report = buildExperimentDraftFromFeedbackEntries([eligibleEntry()], {});
    assert.equal(report.ok, true);
    assert.ok(report.draft);
    assert.deepEqual(report.draft?.source_feedback_refs, ["fb-w3-test-001"]);
    assert.match(String(report.draft?.methodology_hypothesis), /Gate blocks RED/);
    assert.equal(report.draft?.methodology_outcome_observation, undefined);
  });

  it("rejects non-methodology_improvement entries", () => {
    const report = buildExperimentDraftFromFeedbackEntries(
      [eligibleEntry({ type: "bug_report" })],
      {},
    );
    assert.equal(report.ok, false);
    assert.equal(report.draft, null);
  });

  it("rejects stale digest_projection_hash", () => {
    const digest = {
      schema_version: "feedback-analysis-digest.v1",
      client_cohort: { compatibility_key: "test", analysis_window: {} },
      inputs: { entries: 1, excluded: 0, unknown: 0 },
      observations: {
        recurrence: [],
        duplicate_groups: [
          { duplicate_group: "grp-a", member_ids: ["fb-w3-test-001"], count: 1 },
        ],
      },
      impact: { numerator: 1, denominator: "not_measured", unknown: 0 },
      findings: [],
      countermeasures: [],
    } as unknown as FeedbackAnalysisDigestV1;

    const report = runMethodologyKaizenExperimentBridge({
      feedback_ids: ["fb-w3-test-001"],
      digest,
      digest_projection_hash: "deadbeefdeadbeef",
      base_path: "/nonexistent/path/for/empty-store",
    });
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.code === "STALE_DIGEST_HASH" || d.code === "FEEDBACK_NOT_FOUND"));
  });

  it("loads feedback from base_path and builds draft", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "w3-bridge-"));
    fs.writeFileSync(
      path.join(dir, "feedback.yaml"),
      yaml.dump({ entries: [eligibleEntry()] }),
      "utf8",
    );
    const report = runMethodologyKaizenExperimentBridge({
      feedback_ids: ["fb-w3-test-001"],
      base_path: dir,
    });
    assert.equal(report.ok, true);
    assert.deepEqual(report.draft?.source_feedback_refs, ["fb-w3-test-001"]);
  });

  it("draft with source_feedback_refs passes validator when experiment_id added", () => {
    const report = buildExperimentDraftFromFeedbackEntries([eligibleEntry()], {});
    const withId = { ...report.draft!, experiment_id: "mle-bridge-test-001" };
    const validation = validateMethodologyLearningExperimentObject(withId);
    assert.equal(validation.ok, true);
  });

  it("accepts matching digest_projection_hash when digest provided", () => {
    const digest = {
      schema_version: "feedback-analysis-digest.v1",
      client_cohort: { compatibility_key: "test", analysis_window: {} },
      inputs: { entries: 1, excluded: 0, unknown: 0 },
      observations: {
        recurrence: [],
        duplicate_groups: [
          { duplicate_group: "grp-a", member_ids: ["fb-w3-test-001"], count: 1 },
        ],
      },
      impact: { numerator: 1, denominator: "not_measured", unknown: 0 },
      findings: [],
      countermeasures: [],
    } as unknown as FeedbackAnalysisDigestV1;
    const hash = computeProjectionHash(digest);

    const report = runMethodologyKaizenExperimentBridge({
      observation_group: "grp-a",
      digest,
      digest_projection_hash: hash,
      base_path: "/nonexistent/path/for/empty-store",
    });
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.code === "FEEDBACK_NOT_FOUND"));
  });
});
