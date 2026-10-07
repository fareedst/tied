/**
 * Kaizen Phase 4 read-only feedback digest projection.
 * [REQ-KAIZEN-FEEDBACK-ANALYSIS] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [IMPL-KAIZEN_FEEDBACK_ANALYSIS]
 */

import crypto from "node:crypto";
import type { FeedbackEntry } from "./feedback.js";
import { loadFeedback } from "./feedback.js";
import { reportPromotionStatus, type OperationalFeedbackEntry } from "./feedback-promotion.js";

export const FEEDBACK_ANALYSIS_SCHEMA_VERSION = "feedback-analysis.v1" as const;

export type FeedbackAnalysisError =
  | "IncompatibleCohort"
  | "EmptyWindow"
  | "DenominatorMismatch"
  | "MissingEvidenceManifest";

export interface AnalysisWindow {
  start?: string;
  end?: string;
}

export interface CohortSelector {
  /** Target cohort compatibility key entries must match to be included. */
  compatibility_key: string;
  /** Expected denominator fingerprint for the selected cohort (optional). */
  denominator_fingerprint?: string;
  schema_profile?: string;
  client_ids?: string[];
}

export interface DenominatorManifestRef {
  manifest_ref?: string;
  denominator_fingerprint: string;
}

export interface BuildFeedbackDigestParams {
  projectRoot: string;
  window?: AnalysisWindow;
  cohort: CohortSelector;
  denominator_manifest?: DenominatorManifestRef;
  /** When true, absent manifest_ref is a MissingEvidenceManifest failure. */
  require_manifest_ref?: boolean;
  canonicalWrite?: boolean;
  storeMutation?: boolean;
  proposalStatusByFeedbackId?: Record<string, { status: "pending" | "approved" | "rejected" }>;
}

export interface ExcludedEntry {
  id: string;
  reason: "incompatible_cohort" | "outside_window";
}

export interface DuplicateGroupSummary {
  duplicate_group: string;
  member_ids: string[];
  first_seen: string;
}

export interface RecurrenceRow {
  duplicate_group: string;
  count: number;
  numerator_label: string;
}

export interface FeedbackFinding {
  observation_group: string;
  hypothesis: string;
  confidence: "low" | "medium" | "high";
  proof_boundary: string;
  promotion_status: ReturnType<typeof reportPromotionStatus>;
}

export interface FeedbackAnalysisDigestV1 {
  schema_version: typeof FEEDBACK_ANALYSIS_SCHEMA_VERSION;
  client_cohort: {
    compatibility_key: string;
    denominator_fingerprint: string;
    analysis_window: { start: string | null; end: string | null };
  };
  inputs: {
    manifest_ref: string | null;
    entries: number;
    excluded: number;
    unknown: number;
  };
  observations: {
    by_kind: Record<string, number>;
    duplicate_groups: DuplicateGroupSummary[];
    recurrence: RecurrenceRow[];
  };
  impact: {
    numerator: number | "unknown";
    denominator: number | "not_measured";
    unknown: number;
    mismatch_reason?: "denominator_mismatch";
  };
  findings: FeedbackFinding[];
  countermeasures: Array<{
    name: string;
    leap_status: "pending" | "approved" | "rejected" | "applied" | "none";
    outcome: "not_measured";
    outcome_ref?: string;
  }>;
  review: {
    decision: "deferred_review";
    reviewer: null;
  };
  excluded: ExcludedEntry[];
  diagnostics?: {
    error?: FeedbackAnalysisError;
  };
}

export interface BuildFeedbackDigestResult {
  ok: boolean;
  digest?: FeedbackAnalysisDigestV1;
  projection_hash?: string;
  markdown?: string;
  error?: FeedbackAnalysisError;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableJson(obj[k])}`).join(",")}}`;
}

function sha256Hex16(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Per-entry compatibility key from capture schema and privacy tier. */
export function entryCompatibilityKey(entry: FeedbackEntry): string {
  const schema = entry.capture_schema_version?.trim() || "feedback-capture.v1";
  const tier = entry.privacy_tier?.trim() || "unknown";
  return `${schema}|${tier}`;
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Denominator fingerprint from entry context or not_measured. */
export function entryDenominatorFingerprint(entry: FeedbackEntry): string {
  const ctx = entry.context;
  if (ctx && typeof ctx.denominator_fingerprint === "string" && ctx.denominator_fingerprint.trim()) {
    return ctx.denominator_fingerprint.trim();
  }
  if (ctx && ctx.denominator !== undefined && ctx.denominator !== null && typeof ctx.denominator === "object") {
    return sha256Hex16(stableJson(ctx.denominator));
  }
  return "not_measured";
}

function readObservationKind(entry: FeedbackEntry): string {
  const ctx = entry.context;
  if (ctx && typeof ctx.observation_kind === "string" && ctx.observation_kind.trim()) {
    return ctx.observation_kind.trim();
  }
  return "unknown";
}

function occurredAt(entry: FeedbackEntry): string {
  return entry.occurred_at?.trim() || entry.created_at;
}

function inWindow(iso: string, window?: AnalysisWindow): boolean {
  if (!window) return true;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  if (window.start) {
    const s = Date.parse(window.start);
    if (!Number.isNaN(s) && t < s) return false;
  }
  if (window.end) {
    const e = Date.parse(window.end);
    if (!Number.isNaN(e) && t > e) return false;
  }
  return true;
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Read-only snapshot for analysis window. */
export function loadFeedbackSnapshot(
  projectRoot: string,
  window?: AnalysisWindow,
): { entries: readonly FeedbackEntry[]; loaded_at: string } {
  const data = loadFeedback(projectRoot);
  const loaded_at = new Date().toISOString();
  const frozen = Object.freeze(
    data.entries.filter((entry) => inWindow(occurredAt(entry), window)).map((e) => Object.freeze({ ...e })),
  );
  return { entries: frozen, loaded_at };
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Partition entries by cohort compatibility and denominator fingerprint. */
export function computeCohortCompatibility(
  entries: readonly FeedbackEntry[],
  cohort: CohortSelector,
  window?: AnalysisWindow,
): {
  compatibility_key: string;
  denominator_fingerprint: string;
  compatible_entries: FeedbackEntry[];
  excluded: ExcludedEntry[];
} {
  const compatible_entries: FeedbackEntry[] = [];
  const excluded: ExcludedEntry[] = [];
  let denominator_fingerprint = cohort.denominator_fingerprint ?? "not_measured";

  for (const entry of entries) {
    if (!inWindow(occurredAt(entry), window)) {
      excluded.push({ id: entry.id, reason: "outside_window" });
      continue;
    }
    const key = entryCompatibilityKey(entry);
    if (key !== cohort.compatibility_key) {
      excluded.push({ id: entry.id, reason: "incompatible_cohort" });
      continue;
    }
    compatible_entries.push(entry);
    const fp = entryDenominatorFingerprint(entry);
    if (denominator_fingerprint === "not_measured" && fp !== "not_measured") {
      denominator_fingerprint = fp;
    }
  }

  if (cohort.denominator_fingerprint) {
    denominator_fingerprint = cohort.denominator_fingerprint;
  } else if (compatible_entries.length > 0) {
    const fps = new Set(
      compatible_entries.map(entryDenominatorFingerprint).filter((f) => f !== "not_measured"),
    );
    if (fps.size === 1) {
      denominator_fingerprint = [...fps][0]!;
    } else if (fps.size > 1) {
      denominator_fingerprint = "mixed";
    }
  }

  return {
    compatibility_key: cohort.compatibility_key,
    denominator_fingerprint,
    compatible_entries,
    excluded,
  };
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Deterministic duplicate groups and recurrence. */
export function groupAndRecurrence(compatible_entries: readonly FeedbackEntry[]): {
  duplicate_groups: DuplicateGroupSummary[];
  recurrence: RecurrenceRow[];
  by_kind: Record<string, number>;
} {
  const by_kind: Record<string, number> = {};
  const groupMap = new Map<string, FeedbackEntry[]>();

  for (const entry of compatible_entries) {
    const kind = readObservationKind(entry);
    by_kind[kind] = (by_kind[kind] ?? 0) + 1;
    const groupKey = entry.duplicate_group?.trim() || `singleton:${entry.id}`;
    const list = groupMap.get(groupKey) ?? [];
    list.push(entry);
    groupMap.set(groupKey, list);
  }

  const duplicate_groups: DuplicateGroupSummary[] = [];
  const recurrence: RecurrenceRow[] = [];

  for (const [duplicate_group, members] of groupMap) {
    const sorted = [...members].sort((a, b) => occurredAt(a).localeCompare(occurredAt(b)));
    duplicate_groups.push({
      duplicate_group,
      member_ids: sorted.map((m) => m.id),
      first_seen: occurredAt(sorted[0]!),
    });
    recurrence.push({
      duplicate_group,
      count: members.length,
      numerator_label: `observations_in_${duplicate_group}`,
    });
  }

  duplicate_groups.sort((a, b) => a.duplicate_group.localeCompare(b.duplicate_group));
  recurrence.sort((a, b) => b.count - a.count || a.duplicate_group.localeCompare(b.duplicate_group));

  return { duplicate_groups, recurrence, by_kind };
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Numerators and denominators with mismatch handling. */
export function applyDenominatorRules(
  grouped: { recurrence: RecurrenceRow[] },
  cohortFingerprint: string,
  manifest?: DenominatorManifestRef,
): FeedbackAnalysisDigestV1["impact"] {
  const numerator = grouped.recurrence.reduce((sum, row) => sum + row.count, 0);
  let denominator: number | "not_measured" = "not_measured";
  let mismatch_reason: "denominator_mismatch" | undefined;

  if (manifest) {
    if (manifest.denominator_fingerprint !== cohortFingerprint && cohortFingerprint !== "not_measured") {
      mismatch_reason = "denominator_mismatch";
    }
    if (typeof manifest.denominator_fingerprint === "string" && /^\d+$/.test(manifest.denominator_fingerprint)) {
      denominator = Number(manifest.denominator_fingerprint);
    }
  }

  if (cohortFingerprint !== "not_measured" && cohortFingerprint !== "mixed" && !/^\d+$/.test(cohortFingerprint)) {
    // fingerprint-only cohorts keep not_measured unless manifest supplies numeric denominator
  }

  return {
    numerator: numerator > 0 ? numerator : "unknown",
    denominator,
    unknown: grouped.recurrence.length === 0 ? 1 : 0,
    ...(mismatch_reason ? { mismatch_reason } : {}),
  };
}

function asOperationalEntry(entry: FeedbackEntry): OperationalFeedbackEntry | null {
  if (
    entry.source_type &&
    entry.source_id &&
    entry.affected_feature &&
    entry.severity &&
    entry.evidence_links &&
    entry.duplicate_group &&
    entry.promotion_status
  ) {
    return entry as OperationalFeedbackEntry;
  }
  return null;
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Read-only promotion and LEAP status on groups. */
export function resolvePromotionAndLeapRefs(
  duplicate_groups: DuplicateGroupSummary[],
  entriesById: Map<string, FeedbackEntry>,
  proposalStatusByFeedbackId?: BuildFeedbackDigestParams["proposalStatusByFeedbackId"],
): { findings: FeedbackFinding[]; countermeasures: FeedbackAnalysisDigestV1["countermeasures"] } {
  const findings: FeedbackFinding[] = [];
  const countermeasures: FeedbackAnalysisDigestV1["countermeasures"] = [];

  for (const group of duplicate_groups) {
    const lead = entriesById.get(group.member_ids[0] ?? "");
    if (!lead) continue;
    const operational = asOperationalEntry(lead);
    const proposal = proposalStatusByFeedbackId?.[lead.id];
    const promotion_status = operational
      ? reportPromotionStatus(operational, proposal ? { status: proposal.status } : undefined)
      : lead.promotion_status ?? "promotion_pending";

    findings.push({
      observation_group: group.duplicate_group,
      hypothesis: lead.title,
      confidence: "low",
      proof_boundary: "digest_projection_only",
      promotion_status: promotion_status as FeedbackFinding["promotion_status"],
    });

    const leap_status = proposal?.status ?? "none";
    countermeasures.push({
      name: group.duplicate_group,
      leap_status: leap_status === "pending" ? "pending" : leap_status,
      outcome: "not_measured",
    });
  }

  return { findings, countermeasures };
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Stable projection hash from canonical digest body. */
export function computeProjectionHash(digest: Omit<FeedbackAnalysisDigestV1, "diagnostics">): string {
  return sha256Hex16(stableJson(digest));
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Human briefing from digest fields only. */
export function projectFeedbackDigestMarkdown(digest: FeedbackAnalysisDigestV1): string {
  const lines: string[] = [
    `# Feedback analysis (${digest.schema_version})`,
    "",
    `**Cohort:** ${digest.client_cohort.compatibility_key}`,
    `**Window:** ${digest.client_cohort.analysis_window.start ?? "—"} → ${digest.client_cohort.analysis_window.end ?? "—"}`,
    "",
    `Entries: ${digest.inputs.entries}; excluded: ${digest.inputs.excluded}; unknown kinds: ${digest.inputs.unknown}`,
    "",
    "## Recurrence",
  ];
  for (const row of digest.observations.recurrence) {
    lines.push(`- ${row.duplicate_group}: ${row.count}`);
  }
  if (digest.impact.mismatch_reason) {
    lines.push("", `**Denominator mismatch:** ${digest.impact.mismatch_reason}`);
  }
  if (digest.diagnostics?.error) {
    lines.push("", `**Diagnostic:** ${digest.diagnostics.error}`);
  }
  return lines.join("\n");
}

/** [IMPL-KAIZEN_FEEDBACK_ANALYSIS] Primary entry: read-only feedback-analysis.v1 digest. */
export function buildFeedbackDigest(params: BuildFeedbackDigestParams): BuildFeedbackDigestResult {
  if (params.canonicalWrite || params.storeMutation) {
    return { ok: false, error: "IncompatibleCohort" };
  }

  if (params.require_manifest_ref && !params.denominator_manifest?.manifest_ref?.trim()) {
    return { ok: false, error: "MissingEvidenceManifest" };
  }

  const snapshot = loadFeedbackSnapshot(params.projectRoot, params.window);
  const allInStore = loadFeedback(params.projectRoot).entries;
  const windowEntries = snapshot.entries;

  const cohortPartition = computeCohortCompatibility(windowEntries, params.cohort, params.window);
  const totalExcludedOutside = allInStore.filter((e) => !inWindow(occurredAt(e), params.window)).length;

  let diagnosticsError: FeedbackAnalysisError | undefined;

  if (windowEntries.length === 0 && allInStore.length > 0) {
    diagnosticsError = "EmptyWindow";
  } else if (cohortPartition.compatible_entries.length === 0 && windowEntries.length > 0) {
    diagnosticsError = "IncompatibleCohort";
  } else if (cohortPartition.excluded.some((row) => row.reason === "incompatible_cohort")) {
    diagnosticsError = "IncompatibleCohort";
  }

  const grouped = groupAndRecurrence(cohortPartition.compatible_entries);
  const impact = applyDenominatorRules(
    grouped,
    cohortPartition.denominator_fingerprint,
    params.denominator_manifest,
  );
  if (impact.mismatch_reason) {
    diagnosticsError = diagnosticsError ?? "DenominatorMismatch";
  }

  const entriesById = new Map(windowEntries.map((e) => [e.id, e]));
  const { findings, countermeasures } = resolvePromotionAndLeapRefs(
    grouped.duplicate_groups,
    entriesById,
    params.proposalStatusByFeedbackId,
  );

  const unknownKindCount = grouped.by_kind.unknown ?? 0;

  const digest: FeedbackAnalysisDigestV1 = {
    schema_version: FEEDBACK_ANALYSIS_SCHEMA_VERSION,
    client_cohort: {
      compatibility_key: params.cohort.compatibility_key,
      denominator_fingerprint: cohortPartition.denominator_fingerprint,
      analysis_window: {
        start: params.window?.start ?? null,
        end: params.window?.end ?? null,
      },
    },
    inputs: {
      manifest_ref: params.denominator_manifest?.manifest_ref?.trim() ?? null,
      entries: cohortPartition.compatible_entries.length,
      excluded: cohortPartition.excluded.length + totalExcludedOutside,
      unknown: unknownKindCount,
    },
    observations: {
      by_kind: grouped.by_kind,
      duplicate_groups: grouped.duplicate_groups,
      recurrence: grouped.recurrence,
    },
    impact,
    findings,
    countermeasures,
    review: {
      decision: "deferred_review",
      reviewer: null,
    },
    excluded: cohortPartition.excluded,
    ...(diagnosticsError ? { diagnostics: { error: diagnosticsError } } : {}),
  };

  const projection_hash = computeProjectionHash(digest);
  const markdown = projectFeedbackDigestMarkdown(digest);

  return { ok: true, digest, projection_hash, markdown };
}

/** Alias for pseudo-code RUN_FEEDBACK_ANALYSIS. */
export const runFeedbackAnalysis = buildFeedbackDigest;
