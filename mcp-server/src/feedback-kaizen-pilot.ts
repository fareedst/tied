/**
 * Kaizen Phase 7 bounded feedback pilot (analysis evidence only).
 * [REQ-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN-FEEDBACK-PILOT] [IMPL-KAIZEN-FEEDBACK-PILOT]
 */

import fs from "node:fs";
import path from "node:path";
import {
  buildFeedbackDigest,
  computeCohortCompatibility,
  entryCompatibilityKey,
  loadFeedbackSnapshot,
  type AnalysisWindow,
  type CohortSelector,
  type DenominatorManifestRef,
  type FeedbackAnalysisError,
} from "./feedback-analysis.js";
import type { FeedbackEntry } from "./feedback.js";
import { loadFeedback } from "./feedback.js";

export const FEEDBACK_PILOT_SCHEMA_VERSION = "feedback-pilot.v1" as const;

export const PILOT_METRIC_CATALOG = [
  "observations_captured",
  "recurrence_groups",
  "countermeasures_with_outcome",
  "promotion_pending_rate",
] as const;

export type PilotMetricId = (typeof PILOT_METRIC_CATALOG)[number];

export type FeedbackPilotError =
  | "InvalidPilotSpec"
  | "IncompatibleCohort"
  | FeedbackAnalysisError
  | "StopCriteriaTriggered";

export type TransportPhaseStatus = "active" | "deferred_closed";

export interface PilotCohortSpec extends CohortSelector {
  cohort_id: string;
  min_entries?: number;
  max_entries?: number;
}

export interface StopCriteriaPolicy {
  halt_on_trigger?: boolean;
  classification_ambiguity_threshold?: number;
  notification_overload_threshold?: number;
  transport_loss_threshold?: number;
}

export interface PilotSpec {
  cohort_id: string;
  cohort: Omit<PilotCohortSpec, "cohort_id"> & { compatibility_key: string };
  analysis_window?: AnalysisWindow;
  named_metrics: PilotMetricId[];
  stop_criteria_policy: StopCriteriaPolicy;
  transport_phase_status: TransportPhaseStatus;
  denominator_manifest?: DenominatorManifestRef;
  require_manifest_ref?: boolean;
}

export interface PilotMetricRow {
  metric_id: PilotMetricId;
  numerator: number | "unknown";
  denominator: number | "not_measured" | "not_applicable";
  unknown: number;
  excluded: number;
  status: "measured" | "not_measured" | "not_applicable";
}

export type StopCriterionId =
  | "privacy_incident"
  | "notification_overload"
  | "transport_loss"
  | "classification_ambiguity_unresolved"
  | "denominator_incompatible";

export interface StopCriterionRow {
  criterion_id: StopCriterionId;
  status: "clear" | "triggered" | "not_applicable";
  detail?: string;
}

export interface StopCriteriaReport {
  criteria: StopCriterionRow[];
  any_triggered: boolean;
  halted: boolean;
}

export interface FeedbackPilotReportV1 {
  schema_version: typeof FEEDBACK_PILOT_SCHEMA_VERSION;
  cohort_id: string;
  entry_count: number;
  metrics: PilotMetricRow[];
  stop_criteria: StopCriteriaReport;
  promotion_rule: "analysis_evidence_until_separate_sponsor_tied_change";
  proof_boundary: "pilot_volume_not_methodology_change";
  digest_projection_hash: string;
}

export interface ResolvedPilotCohort {
  cohort_id: string;
  selector: CohortSelector;
  entry_count: number;
}

export interface RunKaizenFeedbackPilotParams {
  projectRoot: string;
  spec: PilotSpec;
  pilot_incident_signals?: string[];
  report_out_path?: string;
  canonicalWrite?: boolean;
  storeMutation?: boolean;
}

export interface RunKaizenFeedbackPilotResult {
  ok: boolean;
  report?: FeedbackPilotReportV1;
  error?: FeedbackPilotError;
  stop_criteria?: StopCriteriaReport;
}

function entryClientId(entry: FeedbackEntry): string | undefined {
  const ctx = entry.context;
  if (ctx && typeof ctx.client_id === "string" && ctx.client_id.trim()) {
    return ctx.client_id.trim();
  }
  return undefined;
}

function matchesClientFilter(entry: FeedbackEntry, clientIds?: string[]): boolean {
  if (!clientIds || clientIds.length === 0) return true;
  const cid = entryClientId(entry);
  return cid !== undefined && clientIds.includes(cid);
}

// [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Validate named pilot cohort against digest cohort selector and comparability bounds.
export function resolvePilotCohort(
  projectRoot: string,
  spec: PilotSpec,
): { ok: true; resolved: ResolvedPilotCohort } | { ok: false; error: FeedbackPilotError } {
  if (!spec.cohort_id?.trim() || !spec.cohort?.compatibility_key?.trim()) {
    return { ok: false, error: "InvalidPilotSpec" };
  }

  const snapshot = loadFeedbackSnapshot(projectRoot, spec.analysis_window);
  const minEntries = spec.cohort.min_entries ?? 1;
  const maxEntries = spec.cohort.max_entries;

  const compatible = snapshot.entries.filter(
    (entry) =>
      entryCompatibilityKey(entry) === spec.cohort.compatibility_key &&
      matchesClientFilter(entry, spec.cohort.client_ids),
  );

  const count = compatible.length;
  if (count < minEntries) {
    return { ok: false, error: "IncompatibleCohort" };
  }
  if (maxEntries !== undefined && count > maxEntries) {
    return { ok: false, error: "IncompatibleCohort" };
  }

  const selector: CohortSelector = {
    compatibility_key: spec.cohort.compatibility_key,
    ...(spec.cohort.denominator_fingerprint
      ? { denominator_fingerprint: spec.cohort.denominator_fingerprint }
      : {}),
    ...(spec.cohort.schema_profile ? { schema_profile: spec.cohort.schema_profile } : {}),
    ...(spec.cohort.client_ids ? { client_ids: spec.cohort.client_ids } : {}),
  };

  return {
    ok: true,
    resolved: {
      cohort_id: spec.cohort_id.trim(),
      selector,
      entry_count: count,
    },
  };
}

function countOutcomeObservations(entries: readonly FeedbackEntry[]): number {
  let total = 0;
  for (const entry of entries) {
    const obs = entry.context?.outcome_observations;
    if (Array.isArray(obs)) total += obs.length;
  }
  return total;
}

function countPromotionPending(findings: { promotion_status: string }[]): number {
  return findings.filter((f) => f.promotion_status === "promotion_pending").length;
}

// [IMPL-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-PILOT] — Compose named metrics with explicit denominators from digest and outcome facets.
export function buildNamedPilotMetrics(
  resolved: ResolvedPilotCohort,
  spec: PilotSpec,
  projectRoot: string,
): { ok: true; metrics: PilotMetricRow[]; projection_hash: string } | { ok: false; error: FeedbackPilotError } {
  const digestResult = buildFeedbackDigest({
    projectRoot,
    window: spec.analysis_window,
    cohort: resolved.selector,
    ...(spec.denominator_manifest ? { denominator_manifest: spec.denominator_manifest } : {}),
    ...(spec.require_manifest_ref ? { require_manifest_ref: spec.require_manifest_ref } : {}),
  });

  if (!digestResult.ok || !digestResult.digest || !digestResult.projection_hash) {
    return { ok: false, error: digestResult.error ?? "EmptyWindow" };
  }

  const digest = digestResult.digest;
  const diag = digest.diagnostics?.error;
  if (diag === "EmptyWindow" || diag === "IncompatibleCohort" || diag === "MissingEvidenceManifest") {
    return { ok: false, error: diag };
  }
  if (diag === "DenominatorMismatch") {
    return { ok: false, error: "DenominatorMismatch" };
  }

  const snapshot = loadFeedbackSnapshot(projectRoot, spec.analysis_window);
  const cohortPartition = computeCohortCompatibility(snapshot.entries, resolved.selector, spec.analysis_window);
  const outcomeNumerator = countOutcomeObservations(cohortPartition.compatible_entries);
  const countermeasureDenominator = digest.countermeasures.length;

  const metrics: PilotMetricRow[] = [];

  for (const metricId of spec.named_metrics) {
    if (!PILOT_METRIC_CATALOG.includes(metricId)) {
      return { ok: false, error: "InvalidPilotSpec" };
    }

    switch (metricId) {
      case "observations_captured":
        metrics.push({
          metric_id: metricId,
          numerator: digest.inputs.entries,
          denominator: digest.inputs.entries + digest.inputs.excluded,
          unknown: digest.inputs.unknown,
          excluded: digest.inputs.excluded,
          status: "measured",
        });
        break;
      case "recurrence_groups":
        metrics.push({
          metric_id: metricId,
          numerator: digest.observations.duplicate_groups.length,
          denominator: digest.inputs.entries,
          unknown: 0,
          excluded: digest.inputs.excluded,
          status: digest.inputs.entries > 0 ? "measured" : "not_measured",
        });
        break;
      case "countermeasures_with_outcome":
        metrics.push({
          metric_id: metricId,
          numerator: outcomeNumerator,
          denominator: countermeasureDenominator,
          unknown: 0,
          excluded: 0,
          status: countermeasureDenominator > 0 ? "measured" : "not_measured",
        });
        break;
      case "promotion_pending_rate":
        metrics.push({
          metric_id: metricId,
          numerator: countPromotionPending(digest.findings),
          denominator: digest.inputs.entries,
          unknown: 0,
          excluded: digest.inputs.excluded,
          status: digest.inputs.entries > 0 ? "measured" : "not_measured",
        });
        break;
      default:
        break;
    }
  }

  return { ok: true, metrics, projection_hash: digestResult.projection_hash };
}

// [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Evaluate documented stop criteria; fail closed when triggered.
export function evaluateStopCriteria(
  spec: PilotSpec,
  digest: Awaited<ReturnType<typeof buildFeedbackDigest>>["digest"],
  metrics: PilotMetricRow[],
  pilotIncidentSignals: string[],
  digestError?: FeedbackAnalysisError,
): StopCriteriaReport | { error: "StopCriteriaTriggered"; report: StopCriteriaReport } {
  const policy = spec.stop_criteria_policy;
  const transportDeferred = spec.transport_phase_status === "deferred_closed";
  const criteria: StopCriterionRow[] = [];

  const privacyTriggered = pilotIncidentSignals.includes("privacy_incident");
  criteria.push({
    criterion_id: "privacy_incident",
    status: privacyTriggered ? "triggered" : "clear",
    ...(privacyTriggered ? { detail: "pilot_incident_signal" } : {}),
  });

  if (transportDeferred) {
    criteria.push({ criterion_id: "notification_overload", status: "not_applicable", detail: "transport_deferred" });
    criteria.push({ criterion_id: "transport_loss", status: "not_applicable", detail: "transport_deferred" });
  } else {
    const overloadThreshold = policy.notification_overload_threshold ?? Number.POSITIVE_INFINITY;
    const overloadSignal = pilotIncidentSignals.filter((s) => s === "notification_overload").length;
    criteria.push({
      criterion_id: "notification_overload",
      status: overloadSignal >= overloadThreshold ? "triggered" : "clear",
    });
    const lossThreshold = policy.transport_loss_threshold ?? 1;
    const lossSignal = pilotIncidentSignals.includes("transport_loss");
    criteria.push({
      criterion_id: "transport_loss",
      status: lossSignal && lossThreshold <= 1 ? "triggered" : "clear",
    });
  }

  const unknownCount = digest?.observations.by_kind.unknown ?? 0;
  const ambiguityThreshold = policy.classification_ambiguity_threshold ?? Number.POSITIVE_INFINITY;
  criteria.push({
    criterion_id: "classification_ambiguity_unresolved",
    status: unknownCount >= ambiguityThreshold ? "triggered" : "clear",
    ...(unknownCount >= ambiguityThreshold ? { detail: `unknown_kind_count=${unknownCount}` } : {}),
  });

  const denomIncompatible = digestError === "DenominatorMismatch";
  criteria.push({
    criterion_id: "denominator_incompatible",
    status: denomIncompatible ? "triggered" : "clear",
    ...(digestError === "DenominatorMismatch" ? { detail: "digest_denominator_mismatch" } : {}),
  });

  const anyTriggered = criteria.some((c) => c.status === "triggered");
  const halted = anyTriggered && (policy.halt_on_trigger ?? false);
  const report: StopCriteriaReport = { criteria, any_triggered: anyTriggered, halted };

  if (halted) {
    return { error: "StopCriteriaTriggered", report };
  }
  return report;
}

// [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Emit feedback-pilot.v1 analysis artifact with promotion rule and proof boundary.
export function buildPilotReport(
  resolved: ResolvedPilotCohort,
  metrics: PilotMetricRow[],
  stopCriteria: StopCriteriaReport,
  projectionHash: string,
): FeedbackPilotReportV1 {
  return {
    schema_version: FEEDBACK_PILOT_SCHEMA_VERSION,
    cohort_id: resolved.cohort_id,
    entry_count: resolved.entry_count,
    metrics,
    stop_criteria: stopCriteria,
    promotion_rule: "analysis_evidence_until_separate_sponsor_tied_change",
    proof_boundary: "pilot_volume_not_methodology_change",
    digest_projection_hash: projectionHash,
  };
}

function writeReportAtomic(reportPath: string, report: FeedbackPilotReportV1): void {
  const dir = path.dirname(reportPath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${reportPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, reportPath);
}

// [IMPL-KAIZEN-FEEDBACK-PILOT] [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-PILOT] — Orchestrate cohort resolve, metrics, stop criteria, and report without store mutation.
export function runKaizenFeedbackPilot(params: RunKaizenFeedbackPilotParams): RunKaizenFeedbackPilotResult {
  if (params.canonicalWrite || params.storeMutation) {
    return { ok: false, error: "InvalidPilotSpec" };
  }

  const beforeEntries = loadFeedback(params.projectRoot).entries.length;

  const cohortResult = resolvePilotCohort(params.projectRoot, params.spec);
  if (!cohortResult.ok) {
    return { ok: false, error: cohortResult.error };
  }

  const metricsResult = buildNamedPilotMetrics(cohortResult.resolved, params.spec, params.projectRoot);
  if (!metricsResult.ok) {
    const digestPeek = buildFeedbackDigest({
      projectRoot: params.projectRoot,
      window: params.spec.analysis_window,
      cohort: cohortResult.resolved.selector,
      ...(params.spec.denominator_manifest ? { denominator_manifest: params.spec.denominator_manifest } : {}),
      ...(params.spec.require_manifest_ref ? { require_manifest_ref: params.spec.require_manifest_ref } : {}),
    });
    const stopEval = evaluateStopCriteria(
      params.spec,
      digestPeek.digest,
      [],
      params.pilot_incident_signals ?? [],
      metricsResult.error === "DenominatorMismatch" ? "DenominatorMismatch" : digestPeek.digest?.diagnostics?.error,
    );
    if ("error" in stopEval) {
      const report = buildPilotReport(
        cohortResult.resolved,
        [],
        stopEval.report,
        digestPeek.projection_hash ?? "unknown",
      );
      return { ok: false, error: stopEval.error, report, stop_criteria: stopEval.report };
    }
    if (metricsResult.error === "DenominatorMismatch") {
      const report = buildPilotReport(
        cohortResult.resolved,
        [],
        stopEval,
        digestPeek.projection_hash ?? "unknown",
      );
      if (params.report_out_path) writeReportAtomic(params.report_out_path, report);
      return { ok: false, error: "DenominatorMismatch", report, stop_criteria: stopEval };
    }
    return { ok: false, error: metricsResult.error };
  }

  const digestResult = buildFeedbackDigest({
    projectRoot: params.projectRoot,
    window: params.spec.analysis_window,
    cohort: cohortResult.resolved.selector,
    ...(params.spec.denominator_manifest ? { denominator_manifest: params.spec.denominator_manifest } : {}),
    ...(params.spec.require_manifest_ref ? { require_manifest_ref: params.spec.require_manifest_ref } : {}),
  });

  const stopEval = evaluateStopCriteria(
    params.spec,
    digestResult.digest,
    metricsResult.metrics,
    params.pilot_incident_signals ?? [],
    digestResult.digest?.diagnostics?.error,
  );

  if ("error" in stopEval) {
    const report = buildPilotReport(
      cohortResult.resolved,
      metricsResult.metrics,
      stopEval.report,
      metricsResult.projection_hash,
    );
    if (params.report_out_path) writeReportAtomic(params.report_out_path, report);
    return { ok: false, error: stopEval.error, report, stop_criteria: stopEval.report };
  }

  const report = buildPilotReport(
    cohortResult.resolved,
    metricsResult.metrics,
    stopEval,
    metricsResult.projection_hash,
  );

  if (params.report_out_path) {
    writeReportAtomic(params.report_out_path, report);
  }

  const afterEntries = loadFeedback(params.projectRoot).entries.length;
  if (afterEntries !== beforeEntries) {
    return { ok: false, error: "InvalidPilotSpec" };
  }

  return { ok: true, report, stop_criteria: stopEval };
}

export const RUN_KAIZEN_FEEDBACK_PILOT = runKaizenFeedbackPilot;
