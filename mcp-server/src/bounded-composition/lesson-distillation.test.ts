/**
 * [IMPL-TIED_BOUNDED_LESSON_DISTILLATION] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS, BOUNDED_PROOF_BOUNDARIES } from "./constants.js";
import type { TrajectoryDivergenceReportV1 } from "./divergence-analysis.js";
import { distillTrajectoryLessons } from "./lesson-distillation.js";
import { validateMethodologyLearningExperimentObject } from "../methodology-learning-experiment/validate.js";

function baseReport(overrides: Partial<TrajectoryDivergenceReportV1> = {}): TrajectoryDivergenceReportV1 {
  return {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.divergenceReport,
    request_token: "REQ-TIED_BOUNDED_COMPOSITION",
    manifest_run_ids: ["run-a", "run-b"],
    contrast_rows: [
      {
        dimension: "outcome",
        run_id_a: "run-a",
        run_id_b: "run-b",
        status: "divergent",
        finding_lifecycle: "observed",
        detail: "outcome_hash sha256:a vs sha256:b",
      },
    ],
    proof_boundaries: [BOUNDED_PROOF_BOUNDARIES.advisoryNotGateAuthority],
    content_hash: "sha256:report-stable",
    generated_at: "2026-10-18T17:00:00.000Z",
    truncated_data_present: false,
    ...overrides,
  };
}

describe("distillTrajectoryLessons [IMPL-TIED_BOUNDED_LESSON_DISTILLATION]", () => {
  it("emits draft-only bundle with feedback, vocabulary, and experiment draft", () => {
    const report = baseReport();
    const result = distillTrajectoryLessons(report, {
      expected_report_hash: report.content_hash,
      denominators_present: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.bundle.report.schema_version, BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.lessonDraftReport);
    assert.equal(result.bundle.report.feedback_draft.type, "methodology_improvement");
    assert.ok(result.bundle.report.vocabulary_candidates.length >= 1);
    assert.equal(result.bundle.report.explicit_write_required_for_canonical, true);
    const experimentCheck = validateMethodologyLearningExperimentObject(
      result.bundle.report.methodology_experiment_draft,
    );
    assert.equal(experimentCheck.ok, true);
    assert.deepEqual(
      (result.bundle.report.methodology_experiment_draft.methodology_baseline as { metric_rows: unknown[] })
        .metric_rows[0],
      { name: "bounded_divergence_denominator", value: "not_measured" },
    );
  });

  it("rejects stale report hash", () => {
    const report = baseReport();
    const result = distillTrajectoryLessons(report, {
      expected_report_hash: "sha256:other",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "StaleReport");
  });

  it("rejects ineligible report without advisory proof boundary", () => {
    const report = baseReport({ proof_boundaries: [], contrast_rows: [] });
    const result = distillTrajectoryLessons(report, {
      expected_report_hash: report.content_hash,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "IneligibleInput");
  });

  it("suppresses duplicate lesson groups", () => {
    const report = baseReport();
    const context = {
      expected_report_hash: report.content_hash,
      recorded_lesson_group_ids: ["bc-lesson:sha256:report-stable"],
    };
    const result = distillTrajectoryLessons(report, context);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "DuplicateSuppressed");
  });

  it("refuses silent canonical write attempts", () => {
    const report = baseReport();
    const result = distillTrajectoryLessons(report, {
      expected_report_hash: report.content_hash,
      attempt_canonical_write: true,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "ExplicitWriteRequired");
  });
});
