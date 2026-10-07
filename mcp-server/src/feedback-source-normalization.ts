/**
 * Kaizen Phase 2 shared source normalization.
 * [REQ-KAIZEN-SOURCE-NORMALIZATION] [ARCH-KAIZEN_SOURCE_NORMALIZATION] [IMPL-KAIZEN_SOURCE_NORMALIZATION]
 */

import type { FeedbackType } from "./feedback.js";
import type { OperationalSourceType } from "./feedback-promotion.js";

export const ADAPTER_PRIVACY_TIER = "operator_local" as const;

const BUG_REPORT_KINDS = new Set(["defect", "failed_test", "deployment_failure", "incident"]);

export type SourceNormalizationError = "InvalidPrivacyTier" | "MissingOtherQualifier";

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Reject non-operator_local privacy when tier is declared on adapter payload. */
export function rejectNonOperatorLocalPrivacy(
  tier: string | undefined,
): { ok: true } | { ok: false; error: "InvalidPrivacyTier" } {
  if (tier === undefined || tier.trim() === "") return { ok: true };
  if (tier !== ADAPTER_PRIVACY_TIER) return { ok: false, error: "InvalidPrivacyTier" };
  return { ok: true };
}

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Map operational source_type to default observation kind when payload omits kind. */
export function defaultObservationKindFromSourceType(sourceType: OperationalSourceType): string {
  switch (sourceType) {
    case "incident":
      return "incident";
    case "test_failure":
      return "failed_test";
    case "metric":
      return "missing_information";
    case "user_report":
      return "other";
    default:
      return "unknown";
  }
}

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Infer feedback entry type from observation kind when caller omits entry_type. */
export function inferFeedbackEntryTypeFromObservationKind(kind: string): FeedbackType {
  const normalized = kind.trim().toLowerCase();
  if (BUG_REPORT_KINDS.has(normalized)) return "bug_report";
  return "methodology_improvement";
}

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Caller entry_type wins; otherwise infer from observation kind (or methodology default). */
export function resolveFeedbackEntryType(options: {
  callerEntryType?: FeedbackType;
  observationKind?: string;
}): { entryType: FeedbackType; entryTypeOmitted: boolean } {
  if (options.callerEntryType !== undefined) {
    return { entryType: options.callerEntryType, entryTypeOmitted: false };
  }
  const kindRaw = options.observationKind?.trim();
  if (!kindRaw) {
    return { entryType: "methodology_improvement", entryTypeOmitted: true };
  }
  return {
    entryType: inferFeedbackEntryTypeFromObservationKind(kindRaw),
    entryTypeOmitted: true,
  };
}

export interface AdditiveObservationContext {
  workflow?: string;
  workaround?: string;
  baseline_ref?: string;
  other_qualifier?: string;
}

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Read additive Kaizen context fields from adapter payload without mutating observation text. */
export function extractAdditiveContext(payload?: Record<string, unknown>): AdditiveObservationContext {
  if (!payload) return {};
  const out: AdditiveObservationContext = {};
  for (const key of ["workflow", "workaround", "baseline_ref", "other_qualifier"] as const) {
    const v = payload[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}

/** [IMPL-KAIZEN_SOURCE_NORMALIZATION] Require other_qualifier when observation kind is other (e.g. user_report friction). */
export function validateOtherQualifierRequired(
  observationKind: string,
  payload?: Record<string, unknown>,
): { ok: true } | { ok: false; error: "MissingOtherQualifier" } {
  if (observationKind.trim().toLowerCase() !== "other") return { ok: true };
  const fromPayload = payload?.other_qualifier ?? payload?.observation_kind;
  if (typeof fromPayload === "string" && fromPayload.trim()) return { ok: true };
  const additive = extractAdditiveContext(payload);
  if (additive.other_qualifier?.trim()) return { ok: true };
  return { ok: false, error: "MissingOtherQualifier" };
}

export function readPrivacyTierFromPayload(payload?: Record<string, unknown>): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.privacy_tier === "string") return payload.privacy_tier;
  const client = payload.client;
  if (client && typeof client === "object" && !Array.isArray(client)) {
    const tier = (client as Record<string, unknown>).privacy_tier;
    if (typeof tier === "string") return tier;
  }
  return undefined;
}

export function readCallerEntryTypeFromPayload(payload?: Record<string, unknown>): FeedbackType | undefined {
  if (!payload) return undefined;
  const raw = payload.entry_type;
  if (raw === "feature_request" || raw === "bug_report" || raw === "methodology_improvement") {
    return raw;
  }
  return undefined;
}

export function readObservationKindFromPayload(
  payload: Record<string, unknown> | undefined,
  sourceType?: OperationalSourceType,
): string {
  if (payload && typeof payload.observation_kind === "string" && payload.observation_kind.trim()) {
    return payload.observation_kind.trim();
  }
  if (sourceType) return defaultObservationKindFromSourceType(sourceType);
  return "unknown";
}
