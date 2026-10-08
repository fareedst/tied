/**
 * Kaizen Phase 6 outcome observation loop.
 * [REQ-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-OUTCOME-LOOP] [IMPL-KAIZEN-OUTCOME-LOOP]
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getFeedbackPath, loadFeedback, type FeedbackEntry } from "./feedback.js";
import type { OperationalFeedbackEntry } from "./feedback-promotion.js";
import { writeCanonicalValueAtomic } from "./yaml-canonicalizer.js";

export const OUTCOME_OBSERVATION_SCHEMA_VERSION = "outcome-observation.v1" as const;

export const OUTCOME_VALUES = [
  "improved",
  "unchanged",
  "regressed",
  "inconclusive",
  "not_measured",
] as const;

export type OutcomeValue = (typeof OUTCOME_VALUES)[number];

export type OutcomeLoopError =
  | "MissingEntry"
  | "MissingBaseline"
  | "FollowUpWindowNotOpen"
  | "FollowUpWindowClosed"
  | "InvalidEvidenceLink"
  | "InvalidOutcome"
  | "StoreWriteFailed";

export interface FollowUpWindow {
  start?: string | null;
  end?: string | null;
}

export interface BaselineSnapshot {
  baseline_ref?: string;
  snapshot_fingerprint?: string;
  captured_at?: string;
}

export interface OutcomeObservationPayload {
  entry_id: string;
  outcome: string;
  observed_at: string;
  evidence_links?: string[];
  baseline?: BaselineSnapshot;
  /** When true, measured claims downgrade to inconclusive when evidence is weak. */
  insufficient_evidence?: boolean;
  /** Required for not_measured without baseline anchor. */
  not_measured_waiver?: boolean;
  countermeasure_ref?: string;
  observation_group?: string;
}

export interface BaselineAnchor {
  baseline_ref: string;
  snapshot_fingerprint?: string;
  captured_at?: string;
}

export interface RegressionRouting {
  route: "feedback_analysis";
  observation_group: string;
  entry_id: string;
  baseline_ref: string;
  recorded_at: string;
  reason: "regressed_outcome_observation";
}

export interface OutcomeObservationRecord {
  schema_version: typeof OUTCOME_OBSERVATION_SCHEMA_VERSION;
  observation_id: string;
  outcome: OutcomeValue;
  observed_at: string;
  evidence_links: string[];
  baseline_ref: string;
  snapshot_fingerprint?: string;
  countermeasure_ref?: string;
  recorded_at: string;
}

export interface OutcomeLoopSuccess {
  ok: true;
  outcome: OutcomeValue;
  baseline_ref: string;
  observation_id: string;
  regression_routing?: RegressionRouting;
  proof_boundary: "outcome_observation_local_only";
}

export type OutcomeLoopResult = OutcomeLoopSuccess | { ok: false; error: OutcomeLoopError };

export interface RunOutcomeLoopParams {
  payload: OutcomeObservationPayload;
  projectRoot: string;
  entriesById: ReadonlyMap<string, OperationalFeedbackEntry>;
  follow_up_window: FollowUpWindow;
  canonicalWrite?: boolean;
}

function parseInstant(iso: string): number | null {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

function generateObservationId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `oo-${t}-${r}`;
}

function entryBaselineRef(entry: FeedbackEntry): string | undefined {
  const ctx = entry.context;
  if (!ctx || typeof ctx !== "object") return undefined;
  const ref = ctx.baseline_ref;
  return typeof ref === "string" && ref.trim() ? ref.trim() : undefined;
}

function entryEvidenceIds(entry: FeedbackEntry): string[] {
  const links = entry.evidence_links ?? [];
  return links.filter((link) => typeof link === "string" && link.trim()).map((link) => link.trim());
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Resolve baseline from payload and entry context.
export function resolveBaselineForEntry(
  entry: FeedbackEntry,
  payload: OutcomeObservationPayload,
  classifiedOutcome: OutcomeValue,
): { ok: true; anchor: BaselineAnchor } | { ok: false; error: "MissingBaseline" } {
  const payloadRef = payload.baseline?.baseline_ref?.trim();
  const entryRef = entryBaselineRef(entry);
  const baseline_ref = payloadRef || entryRef || "";

  if (!baseline_ref) {
    if (classifiedOutcome === "not_measured") {
      return { ok: true, anchor: { baseline_ref: "" } };
    }
    return { ok: false, error: "MissingBaseline" };
  }

  const snapshot_fingerprint =
    payload.baseline?.snapshot_fingerprint?.trim() ||
    (typeof entry.context?.baseline_snapshot_fingerprint === "string"
      ? entry.context.baseline_snapshot_fingerprint.trim()
      : undefined);
  const captured_at = payload.baseline?.captured_at?.trim() || undefined;

  return {
    ok: true,
    anchor: {
      baseline_ref,
      ...(snapshot_fingerprint ? { snapshot_fingerprint } : {}),
      ...(captured_at ? { captured_at } : {}),
    },
  };
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Follow-up window bounds on observed_at.
export function validateFollowUpWindow(
  follow_up_window: FollowUpWindow,
  observed_at: string,
): { ok: true } | { ok: false; error: "FollowUpWindowNotOpen" | "FollowUpWindowClosed" } {
  const observed = parseInstant(observed_at);
  if (observed === null) {
    return { ok: false, error: "FollowUpWindowNotOpen" };
  }
  const start = follow_up_window.start?.trim();
  const end = follow_up_window.end?.trim();
  if (start) {
    const startMs = parseInstant(start);
    if (startMs !== null && observed < startMs) {
      return { ok: false, error: "FollowUpWindowNotOpen" };
    }
  }
  if (end) {
    const endMs = parseInstant(end);
    if (endMs !== null && observed > endMs) {
      return { ok: false, error: "FollowUpWindowClosed" };
    }
  }
  return { ok: true };
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Closed enum and insufficient-evidence downgrade.
export function classifyOutcomeValue(
  rawOutcome: string,
  insufficient_evidence?: boolean,
): { ok: true; outcome: OutcomeValue } | { ok: false; error: "InvalidOutcome" } {
  let outcome = rawOutcome.trim() as OutcomeValue;
  if (!OUTCOME_VALUES.includes(outcome)) {
    return { ok: false, error: "InvalidOutcome" };
  }
  if (insufficient_evidence && outcome !== "inconclusive") {
    outcome = "inconclusive";
  }
  return { ok: true, outcome };
}

function linkMatchesBaselineOrEntryEvidence(
  link: string,
  baseline_ref: string,
  entryEvidence: string[],
): boolean {
  if (baseline_ref && (link === baseline_ref || link.startsWith(`${baseline_ref}:`) || link.includes(baseline_ref))) {
    return true;
  }
  return entryEvidence.some((ev) => link === ev || link.includes(ev));
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Evidence link integrity vs baseline and entry anchors.
export function validateEvidenceLinkIntegrity(
  outcome: OutcomeValue,
  evidence_links: string[] | undefined,
  baseline: BaselineAnchor,
  entry: FeedbackEntry,
  insufficient_evidence?: boolean,
): { ok: true } | { ok: false; error: "InvalidEvidenceLink" } {
  const links = (evidence_links ?? []).map((l) => (typeof l === "string" ? l.trim() : ""));
  const measured = outcome === "improved" || outcome === "unchanged" || outcome === "regressed";

  if (links.some((link) => !link)) {
    return { ok: false, error: "InvalidEvidenceLink" };
  }

  if (measured && links.length === 0) {
    return { ok: false, error: "InvalidEvidenceLink" };
  }

  if (outcome === "inconclusive" && links.length === 0 && !insufficient_evidence) {
    return { ok: false, error: "InvalidEvidenceLink" };
  }

  if (outcome === "not_measured") {
    return { ok: true };
  }

  if (!baseline.baseline_ref) {
    return { ok: true };
  }

  if (links.length === 0 && outcome === "inconclusive" && insufficient_evidence) {
    return { ok: true };
  }

  const entryEvidence = entryEvidenceIds(entry);
  const hasAnchor = links.some((link) =>
    linkMatchesBaselineOrEntryEvidence(link, baseline.baseline_ref, entryEvidence),
  );

  if (!hasAnchor && outcome !== "inconclusive") {
    return { ok: false, error: "InvalidEvidenceLink" };
  }

  if (!hasAnchor && outcome === "inconclusive" && !insufficient_evidence) {
    return { ok: false, error: "InvalidEvidenceLink" };
  }

  return { ok: true };
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-OUTCOME-LOOP] — Regression facet for digest rerun.
export function routeRegressionToAnalysis(
  outcome: OutcomeValue,
  entry: OperationalFeedbackEntry,
  baseline_ref: string,
  recorded_at: string,
  observation_group?: string,
): RegressionRouting | null {
  if (outcome !== "regressed") return null;
  const group =
    observation_group?.trim() ||
    entry.duplicate_group?.trim() ||
    entry.id;
  return {
    route: "feedback_analysis",
    observation_group: group,
    entry_id: entry.id,
    baseline_ref,
    recorded_at,
    reason: "regressed_outcome_observation",
  };
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [IMPL-MCP_FEEDBACK_TOOLS] [REQ-KAIZEN-OUTCOME-LOOP] — Append-only outcome observation on entry context.
export function persistOutcomeObservation(
  entryId: string,
  record: OutcomeObservationRecord,
  projectRoot: string,
): { ok: true; observation_id: string; persisted_at: string } | { ok: false; error: "MissingEntry" | "StoreWriteFailed" } {
  const data = loadFeedback(projectRoot);
  const index = data.entries.findIndex((e) => e.id === entryId);
  if (index < 0) {
    return { ok: false, error: "MissingEntry" };
  }
  const entry = data.entries[index]!;
  const ctx =
    entry.context && typeof entry.context === "object" ? { ...entry.context } : {};
  const existing = Array.isArray(ctx.outcome_observations) ? [...ctx.outcome_observations] : [];
  existing.push({ ...record });
  ctx.outcome_observations = existing;
  entry.context = ctx;

  const filePath = getFeedbackPath(projectRoot);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const write = writeCanonicalValueAtomic(filePath, { entries: data.entries });
    if (!write.ok) {
      return { ok: false, error: "StoreWriteFailed" };
    }
    return { ok: true, observation_id: record.observation_id, persisted_at: record.recorded_at };
  } catch {
    return { ok: false, error: "StoreWriteFailed" };
  }
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Structured success surface for callers.
export function buildOutcomeLoopResult(
  outcome: OutcomeValue,
  baseline: BaselineAnchor,
  observation_id: string,
  regression_routing?: RegressionRouting | null,
): OutcomeLoopSuccess {
  return {
    ok: true,
    outcome,
    baseline_ref: baseline.baseline_ref,
    observation_id,
    proof_boundary: "outcome_observation_local_only",
    ...(regression_routing ? { regression_routing } : {}),
  };
}

// [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Primary orchestration entry.
export function runOutcomeLoop(params: RunOutcomeLoopParams): OutcomeLoopResult {
  const entry = params.entriesById.get(params.payload.entry_id);
  if (!entry) {
    return { ok: false, error: "MissingEntry" };
  }

  const rawOutcome = params.payload.outcome.trim();
  const preClassify = classifyOutcomeValue(rawOutcome);
  if (!preClassify.ok) {
    return { ok: false, error: preClassify.error };
  }

  const baselineResolved = resolveBaselineForEntry(entry, params.payload, preClassify.outcome);
  if (!baselineResolved.ok) {
    return { ok: false, error: baselineResolved.error };
  }
  const baseline = baselineResolved.anchor;

  const windowCheck = validateFollowUpWindow(params.follow_up_window, params.payload.observed_at);
  if (!windowCheck.ok) {
    return { ok: false, error: windowCheck.error };
  }

  const classified = classifyOutcomeValue(rawOutcome, params.payload.insufficient_evidence);
  if (!classified.ok) {
    return { ok: false, error: classified.error };
  }
  const outcome = classified.outcome;

  const evidenceCheck = validateEvidenceLinkIntegrity(
    outcome,
    params.payload.evidence_links,
    baseline,
    entry,
    params.payload.insufficient_evidence,
  );
  if (!evidenceCheck.ok) {
    return { ok: false, error: evidenceCheck.error };
  }

  const recorded_at = new Date().toISOString();
  const observation_id = generateObservationId();
  const record: OutcomeObservationRecord = {
    schema_version: OUTCOME_OBSERVATION_SCHEMA_VERSION,
    observation_id,
    outcome,
    observed_at: params.payload.observed_at,
    evidence_links: [...(params.payload.evidence_links ?? []).map((l) => l.trim()).filter(Boolean)],
    baseline_ref: baseline.baseline_ref,
    ...(baseline.snapshot_fingerprint ? { snapshot_fingerprint: baseline.snapshot_fingerprint } : {}),
    ...(params.payload.countermeasure_ref?.trim()
      ? { countermeasure_ref: params.payload.countermeasure_ref.trim() }
      : {}),
    recorded_at,
  };

  const persisted = persistOutcomeObservation(params.payload.entry_id, record, params.projectRoot);
  if (!persisted.ok) {
    return { ok: false, error: persisted.error };
  }

  const regression_routing = routeRegressionToAnalysis(
    outcome,
    entry,
    baseline.baseline_ref,
    recorded_at,
    params.payload.observation_group,
  );

  return buildOutcomeLoopResult(outcome, baseline, observation_id, regression_routing);
}

/** Stable hash helper for immutability tests. */
export function fileContentSha256(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}
