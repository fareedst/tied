/**
 * [IMPL-TIED_BOUNDED_LESSON_DISTILLATION] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * DISTILL_TRAJECTORY_LESSONS — draft-only lesson distillation (no canonical writes).
 */

import { prettyCanonicalJson } from "../storage-dump.js";
import fs from "node:fs";
import path from "node:path";

import { workingPathRelativeToProject } from "../working-root.js";
import {
  BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS,
  BOUNDED_PROOF_BOUNDARIES,
} from "./constants.js";
import { stableJsonHash } from "./content-hash.js";
import type { TrajectoryDivergenceReportV1 } from "./divergence-analysis.js";
import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "../methodology-learning-experiment/constants.js";

export type LessonDistillationErrorCode =
  | "StaleReport"
  | "IneligibleInput"
  | "ExplicitWriteRequired"
  | "DuplicateSuppressed";

export type LessonDistillationError = {
  code: LessonDistillationErrorCode;
  detail: string;
};

export type TrajectoryLessonDraftReportV1 = {
  schema_version: typeof BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.lessonDraftReport;
  request_token: string;
  source_report_content_hash: string;
  feedback_draft: {
    type: "methodology_improvement";
    title: string;
    description: string;
    evidence_refs: string[];
    observation_context: Record<string, unknown>;
  };
  vocabulary_candidates: Array<{
    term: string;
    definition_hint: string;
    evidence_refs: string[];
  }>;
  methodology_experiment_draft: Record<string, unknown>;
  duplicate_group_id: string;
  explicit_write_required_for_canonical: true;
  proof_boundaries: string[];
  content_hash: string;
  generated_at: string;
};

export type DistillTrajectoryLessonsContext = {
  expected_report_hash?: string;
  denominators_present?: boolean;
  recorded_lesson_group_ids?: string[];
  attempt_canonical_write?: boolean;
  now?: string;
};

export type DistillTrajectoryLessonsResult =
  | { ok: true; bundle: { report: TrajectoryLessonDraftReportV1 } }
  | { ok: false; error: LessonDistillationError };

function fail(code: LessonDistillationErrorCode, detail: string): DistillTrajectoryLessonsResult {
  return { ok: false, error: { code, detail } };
}

function lessonGroupId(report: TrajectoryDivergenceReportV1): string {
  return `bc-lesson:${report.content_hash}`;
}

function reportEligible(report: TrajectoryDivergenceReportV1): boolean {
  const hasAdvisoryBoundary = report.proof_boundaries.includes(
    BOUNDED_PROOF_BOUNDARIES.advisoryNotGateAuthority,
  );
  const hasContrast = report.contrast_rows.length > 0;
  return hasAdvisoryBoundary && hasContrast;
}

function buildExperimentDraft(
  report: TrajectoryDivergenceReportV1,
  denominatorsPresent: boolean,
  duplicateGroupId: string,
): Record<string, unknown> {
  const divergent = report.contrast_rows.filter((row) => row.status === "divergent");
  const hypothesis =
    divergent.length > 0
      ? `Bounded divergence observed across ${divergent.length} contrast row(s); review trajectory manifests before methodology change.`
      : "Bounded divergence report produced; review contrast rows before methodology change.";

  return {
    schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
    experiment_id: `bc-lesson-${report.content_hash.slice(7, 19)}`,
    production_system_surface: "checklist_step",
    methodology_hypothesis: hypothesis,
    methodology_baseline: {
      metric_rows: [
        {
          name: "bounded_divergence_denominator",
          value: denominatorsPresent ? "observed" : "not_measured",
        },
      ],
    },
    methodology_outcome_observation: {
      value: "not_measured",
    },
    proof_boundary:
      "Draft-only distillation from bounded divergence report; does not prove methodology effectiveness.",
    privacy_tier: "operator_local",
    source_feedback_refs: [`draft:${duplicateGroupId}`],
    surface_ref: report.request_token,
  };
}

export function distillTrajectoryLessons(
  report: TrajectoryDivergenceReportV1,
  context: DistillTrajectoryLessonsContext = {},
): DistillTrajectoryLessonsResult {
  if (context.attempt_canonical_write === true) {
    return fail(
      "ExplicitWriteRequired",
      "canonical feedback, vocabulary, or experiment writes require an explicit operator bridge",
    );
  }

  if (context.expected_report_hash && context.expected_report_hash !== report.content_hash) {
    return fail("StaleReport", "divergence report content_hash does not match expected projection");
  }

  if (!reportEligible(report)) {
    return fail("IneligibleInput", "report missing advisory proof boundary or contrast rows");
  }

  const duplicateGroupId = lessonGroupId(report);
  const recorded = context.recorded_lesson_group_ids ?? [];
  if (recorded.includes(duplicateGroupId)) {
    return fail("DuplicateSuppressed", `lesson group already recorded: ${duplicateGroupId}`);
  }

  const generatedAt = context.now ?? new Date().toISOString();
  const evidenceRefs = [
    `divergence-report:${report.content_hash}`,
    ...report.manifest_run_ids.map((runId) => `trajectory-manifest:${runId}`),
  ];

  const divergentRows = report.contrast_rows.filter((row) => row.status === "divergent");
  const feedbackDescription =
    divergentRows.length > 0
      ? `Observed ${divergentRows.length} divergent contrast row(s) in bounded trajectory analysis.`
      : "Bounded divergence report available for operator review.";

  const reportBody = {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.lessonDraftReport,
    request_token: report.request_token,
    source_report_content_hash: report.content_hash,
    feedback_draft: {
      type: "methodology_improvement" as const,
      title: "Bounded trajectory divergence lesson draft",
      description: feedbackDescription,
      evidence_refs: evidenceRefs,
      observation_context: {
        truncated_data_present: report.truncated_data_present,
        contrast_row_count: report.contrast_rows.length,
        divergent_row_count: divergentRows.length,
        conformance_only_trap_honored: context.denominators_present !== true,
      },
    },
    vocabulary_candidates: [
      {
        term: "bounded trajectory divergence",
        definition_hint: "Deterministic contrast between compact trajectory manifests under a pilot budget.",
        evidence_refs: evidenceRefs,
      },
      {
        term: "lesson draft",
        definition_hint: "Draft-only distillation requiring explicit operator bridge before canonical TIED writes.",
        evidence_refs: evidenceRefs,
      },
    ],
    methodology_experiment_draft: buildExperimentDraft(
      report,
      context.denominators_present === true,
      duplicateGroupId,
    ),
    duplicate_group_id: duplicateGroupId,
    explicit_write_required_for_canonical: true as const,
    proof_boundaries: [
      BOUNDED_PROOF_BOUNDARIES.advisoryNotGateAuthority,
      BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn,
    ],
    generated_at: generatedAt,
  };

  const lessonReport: TrajectoryLessonDraftReportV1 = {
    ...reportBody,
    content_hash: stableJsonHash({
      source_report_content_hash: reportBody.source_report_content_hash,
      duplicate_group_id: reportBody.duplicate_group_id,
      feedback_draft: reportBody.feedback_draft,
      vocabulary_candidates: reportBody.vocabulary_candidates,
      methodology_experiment_draft: reportBody.methodology_experiment_draft,
    }),
  };

  return { ok: true, bundle: { report: lessonReport } };
}

export function writeTrajectoryLessonDraftReport(
  projectRoot: string,
  requestToken: string,
  report: TrajectoryLessonDraftReportV1,
): string {
  const filename = `bounded-lesson-draft-report-${report.content_hash.slice(7, 19)}.v1.json`;
  const relative = workingPathRelativeToProject(projectRoot, requestToken, "evidence", filename);
  const absolute = path.join(projectRoot, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${prettyCanonicalJson(report)}\n`, "utf8");
  return relative;
}
