/**
 * [REQ-KAIZEN-FEEDBACK-MCP-WIRING] [IMPL-KAIZEN-FEEDBACK-MCP-WIRING] — Thin MCP delegates for Kaizen Phase 4–7 modules.
 */

import path from "node:path";
import { getBasePath } from "./yaml-loader.js";
import { loadFeedback } from "./feedback.js";
import {
  buildFeedbackDigest,
  type BuildFeedbackDigestParams,
  type CohortSelector,
  type AnalysisWindow,
  type DenominatorManifestRef,
  type FeedbackAnalysisDigestV1,
  FEEDBACK_ANALYSIS_SCHEMA_VERSION,
} from "./feedback-analysis.js";
import { runDigestReviewBridge } from "./feedback-review-bridge.js";
import {
  runOutcomeLoop,
  type FollowUpWindow,
  type OutcomeObservationPayload,
} from "./feedback-outcome-loop.js";
import { runKaizenFeedbackPilot, type PilotSpec } from "./feedback-kaizen-pilot.js";
import type { OperationalFeedbackEntry, ReviewDecision } from "./feedback-promotion.js";

export function resolveFeedbackProjectRoot(basePath?: string): string {
  if (basePath?.trim()) return path.resolve(basePath.trim());
  return getBasePath();
}

export function loadEntriesById(projectRoot: string): Map<string, OperationalFeedbackEntry> {
  const data = loadFeedback(projectRoot);
  const map = new Map<string, OperationalFeedbackEntry>();
  for (const entry of data.entries) {
    map.set(entry.id, entry as OperationalFeedbackEntry);
  }
  return map;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCohort(raw: unknown): CohortSelector | null {
  if (!isRecord(raw)) return null;
  const key = raw.compatibility_key;
  if (typeof key !== "string" || !key.trim()) return null;
  return {
    compatibility_key: key.trim(),
    ...(typeof raw.denominator_fingerprint === "string"
      ? { denominator_fingerprint: raw.denominator_fingerprint }
      : {}),
    ...(typeof raw.schema_profile === "string" ? { schema_profile: raw.schema_profile } : {}),
    ...(Array.isArray(raw.client_ids)
      ? { client_ids: raw.client_ids.filter((id): id is string => typeof id === "string") }
      : {}),
  };
}

export function handleTiedFeedbackAnalysisDigest(args: {
  cohort?: unknown;
  window?: unknown;
  denominator_manifest?: unknown;
  require_manifest_ref?: boolean;
  include_markdown?: boolean;
  base_path?: string;
}): Record<string, unknown> {
  const cohort = parseCohort(args.cohort);
  if (!cohort) return { ok: false, error: "InvalidArgsJson" };

  const projectRoot = resolveFeedbackProjectRoot(args.base_path);
  const params: BuildFeedbackDigestParams = {
    projectRoot,
    cohort,
    storeMutation: false,
    canonicalWrite: false,
  };
  if (isRecord(args.window)) {
    params.window = args.window as unknown as AnalysisWindow;
  }
  if (isRecord(args.denominator_manifest)) {
    params.denominator_manifest = args.denominator_manifest as unknown as DenominatorManifestRef;
  }
  if (args.require_manifest_ref) params.require_manifest_ref = true;

  const result = buildFeedbackDigest(params);
  if (!result.ok) return { ok: false, error: result.error ?? "ModuleDelegationError" };

  const out: Record<string, unknown> = {
    ok: true,
    digest: result.digest,
    projection_hash: result.projection_hash,
  };
  if (args.include_markdown !== false && result.markdown) out.markdown = result.markdown;
  return out;
}

function parseDigest(raw: unknown): FeedbackAnalysisDigestV1 | null {
  if (!isRecord(raw)) return null;
  if (raw.schema_version !== FEEDBACK_ANALYSIS_SCHEMA_VERSION) return null;
  return raw as unknown as FeedbackAnalysisDigestV1;
}

export function handleTiedFeedbackReviewBridge(args: {
  digest?: unknown;
  observation_group?: string;
  review?: unknown;
  review_context?: unknown;
  base_path?: string;
}): Record<string, unknown> {
  const digest = parseDigest(args.digest);
  if (!digest) return { ok: false, error: "InvalidArgsJson" };
  const observation_group = args.observation_group?.trim();
  if (!observation_group) return { ok: false, error: "InvalidArgsJson" };

  const projectRoot = resolveFeedbackProjectRoot(args.base_path);
  const entriesById = loadEntriesById(projectRoot);
  const result = runDigestReviewBridge({
    digest,
    observation_group,
    review: args.review as ReviewDecision | undefined,
    review_context: isRecord(args.review_context)
      ? (args.review_context as { projection_hash?: string })
      : undefined,
    projectRoot,
    entriesById,
    canonicalWrite: false,
  });
  return result as Record<string, unknown>;
}

export function handleTiedFeedbackOutcomeRecord(args: {
  payload?: unknown;
  follow_up_window?: unknown;
  base_path?: string;
}): Record<string, unknown> {
  if (!isRecord(args.payload) || !isRecord(args.follow_up_window)) {
    return { ok: false, error: "InvalidArgsJson" };
  }
  const payload = args.payload as unknown as OutcomeObservationPayload;
  if (typeof payload.entry_id !== "string" || !payload.entry_id.trim()) {
    return { ok: false, error: "InvalidArgsJson" };
  }
  const follow_up_window = args.follow_up_window as unknown as FollowUpWindow;

  const projectRoot = resolveFeedbackProjectRoot(args.base_path);
  const entriesById = loadEntriesById(projectRoot);
  const result = runOutcomeLoop({
    payload,
    follow_up_window,
    projectRoot,
    entriesById,
    canonicalWrite: false,
  });
  return result as Record<string, unknown>;
}

export function handleTiedFeedbackPilotRun(args: {
  spec?: unknown;
  pilot_incident_signals?: string[];
  report_out_path?: string;
  base_path?: string;
}): Record<string, unknown> {
  if (!isRecord(args.spec)) return { ok: false, error: "InvalidArgsJson" };
  const spec = args.spec as unknown as PilotSpec;
  if (typeof spec.cohort_id !== "string" || !spec.cohort_id.trim()) {
    return { ok: false, error: "InvalidArgsJson" };
  }
  if (!isRecord(spec.cohort) || typeof spec.cohort.compatibility_key !== "string") {
    return { ok: false, error: "InvalidArgsJson" };
  }

  const projectRoot = resolveFeedbackProjectRoot(args.base_path);
  const result = runKaizenFeedbackPilot({
    projectRoot,
    spec,
    pilot_incident_signals: args.pilot_incident_signals,
    report_out_path: args.report_out_path,
    canonicalWrite: false,
    storeMutation: false,
  });
  if (!result.ok) return { ok: false, error: result.error ?? "ModuleDelegationError", stop_criteria: result.stop_criteria };
  return { ok: true, report: result.report, stop_criteria: result.stop_criteria };
}
