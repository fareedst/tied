/**
 * Kaizen Phase 1 point-of-work observation capture.
 * [REQ-KAIZEN-OBSERVATION-CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [IMPL-KAIZEN_OBSERVATION_CAPTURE]
 */

import fs from "node:fs";
import path from "node:path";
import {
  FEEDBACK_TYPES,
  getFeedbackPath,
  loadFeedback,
  type FeedbackEntry,
  type FeedbackType,
} from "./feedback.js";
import { writeCanonicalValueAtomic } from "./yaml-canonicalizer.js";
import { resolveFeedbackEntryType } from "./feedback-source-normalization.js";

export const CAPTURE_PRIVACY_TIER = "operator_local" as const;
export type CapturePrivacyTier = typeof CAPTURE_PRIVACY_TIER;

export const CAPTURE_SCHEMA_VERSION = "feedback-event.v1";

const GENERIC_PROSE_REF = /^(tests?\s+passed|build\s+ok|success|ok)$/i;

export interface CaptureObservationParams {
  privacy_tier: string;
  title: string;
  description: string;
  idempotency_key: string;
  occurred_at?: string;
  observation_kind?: string;
  entry_type?: FeedbackType;
  impact?: string;
  evidence_refs?: string[];
  client?: Record<string, unknown>;
  source?: Record<string, unknown>;
}

export interface CaptureReceipt {
  feedback_id: string;
  occurred_at: string;
  created_at: string;
  observation_kind: string;
  source?: Record<string, unknown>;
  impact: string;
  idempotent_replay: boolean;
  duplicate_group: string | null;
  evidence_refs_validated: string[];
  evidence_refs_rejected: string[];
  notification_disposition: "not_configured";
  next_local_action?: string;
}

export interface CaptureResult {
  ok: boolean;
  receipt?: CaptureReceipt;
  error?: string;
}

function generateId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `fb-${t}-${r}`;
}

function isIso8601(value: string): boolean {
  const ms = Date.parse(value);
  return Number.isFinite(ms);
}

/** [IMPL-KAIZEN_OBSERVATION_CAPTURE] Classify one evidence ref for capture-time validation. */
export function classifyEvidenceRef(ref: unknown): "valid" | "invalid" {
  if (typeof ref !== "string") return "invalid";
  const trimmed = ref.trim();
  if (!trimmed || trimmed.length > 2048) return "invalid";
  if (GENERIC_PROSE_REF.test(trimmed)) return "invalid";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return "valid";
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) return "valid";
  return "invalid";
}

/** [IMPL-KAIZEN_OBSERVATION_CAPTURE] FIND_ENTRY_BY_IDEMPOTENCY_KEY */
export function findEntryByIdempotencyKey(
  idempotencyKey: string,
  basePath?: string
): FeedbackEntry | undefined {
  const key = typeof idempotencyKey === "string" ? idempotencyKey.trim() : "";
  if (!key) return undefined;
  const data = loadFeedback(basePath);
  return data.entries.find((e) => e.idempotency_key === key);
}

function partitionEvidenceRefs(refs: string[] | undefined): {
  validated: string[];
  rejected: string[];
} {
  const validated: string[] = [];
  const rejected: string[] = [];
  if (!refs) return { validated, rejected };
  for (const ref of refs) {
    if (classifyEvidenceRef(ref) === "valid") validated.push(ref.trim());
    else rejected.push(typeof ref === "string" ? ref : String(ref));
  }
  return { validated, rejected };
}

/** [IMPL-KAIZEN_OBSERVATION_CAPTURE] BUILD_CAPTURE_RECEIPT */
export function buildCaptureReceipt(
  entry: FeedbackEntry,
  options: {
    idempotent_replay: boolean;
    evidence_refs_validated: string[];
    evidence_refs_rejected: string[];
    impact?: string;
  }
): CaptureReceipt {
  const captureCtx = (entry.context?.capture ?? {}) as Record<string, unknown>;
  const obs = (captureCtx.observation ?? {}) as Record<string, unknown>;
  const kindRaw = obs.kind ?? entry.context?.observation_kind;
  const observation_kind =
    typeof kindRaw === "string" && kindRaw.trim() ? kindRaw.trim() : "unknown";
  const impact =
    options.impact ??
    (typeof obs.impact === "string" && obs.impact.trim() ? obs.impact.trim() : "unknown");

  return {
    feedback_id: entry.id,
    occurred_at: entry.occurred_at ?? entry.created_at,
    created_at: entry.created_at,
    observation_kind,
    impact,
    idempotent_replay: options.idempotent_replay,
    duplicate_group: entry.duplicate_group ?? null,
    evidence_refs_validated: options.evidence_refs_validated,
    evidence_refs_rejected: options.evidence_refs_rejected,
    notification_disposition: "not_configured",
  };
}

/** [IMPL-KAIZEN_OBSERVATION_CAPTURE] CAPTURE_OPERATIONAL_OBSERVATION */
export function captureOperationalObservation(
  params: CaptureObservationParams,
  basePath?: string
): CaptureResult {
  if (params.privacy_tier !== CAPTURE_PRIVACY_TIER) {
    return {
      ok: false,
      error: `Invalid privacy tier: ${params.privacy_tier}. Phase 1 capture accepts only ${CAPTURE_PRIVACY_TIER}`,
    };
  }

  const trimmedTitle = typeof params.title === "string" ? params.title.trim() : "";
  if (!trimmedTitle) {
    return { ok: false, error: "title is required and must be non-empty" };
  }
  const trimmedDesc = typeof params.description === "string" ? params.description.trim() : "";
  if (!trimmedDesc) {
    return { ok: false, error: "description is required and must be non-empty" };
  }

  const idempotencyKey =
    typeof params.idempotency_key === "string" ? params.idempotency_key.trim() : "";
  if (!idempotencyKey) {
    return { ok: false, error: "idempotency_key is required and must be non-empty" };
  }

  const existing = findEntryByIdempotencyKey(idempotencyKey, basePath);
  if (existing) {
    const { validated, rejected } = partitionEvidenceRefs(params.evidence_refs);
    return {
      ok: true,
      receipt: buildCaptureReceipt(existing, {
        idempotent_replay: true,
        evidence_refs_validated: validated,
        evidence_refs_rejected: rejected,
        impact: params.impact,
      }),
    };
  }

  if (params.entry_type !== undefined && !FEEDBACK_TYPES.includes(params.entry_type)) {
    return {
      ok: false,
      error: `Invalid entry type: ${params.entry_type}. Must be one of ${FEEDBACK_TYPES.join(", ")}`,
    };
  }

  if (params.occurred_at !== undefined) {
    if (typeof params.occurred_at !== "string" || !isIso8601(params.occurred_at)) {
      return { ok: false, error: "occurred_at must be a valid ISO-8601 timestamp when provided" };
    }
  }

  const { validated, rejected } = partitionEvidenceRefs(params.evidence_refs);

  const { entryType, entryTypeOmitted } = resolveFeedbackEntryType({
    callerEntryType: params.entry_type,
    observationKind: params.observation_kind,
  });

  const created_at = new Date().toISOString();
  const id = generateId();

  const captureBlock: Record<string, unknown> = {
    schema_version: CAPTURE_SCHEMA_VERSION,
    entry_type_omitted: entryTypeOmitted,
    observation: {
      ...(params.observation_kind ? { kind: params.observation_kind } : {}),
      title: trimmedTitle,
      ...(params.impact ? { impact: params.impact } : {}),
    },
    evidence: {
      refs: validated,
      redaction: "not_required",
    },
    delivery: {
      idempotency_key: idempotencyKey,
      attempted_at: created_at,
    },
  };
  if (params.client) captureBlock.client = params.client;

  const entry: FeedbackEntry = {
    id,
    type: entryType,
    title: trimmedTitle,
    description: trimmedDesc,
    created_at,
    idempotency_key: idempotencyKey,
    privacy_tier: CAPTURE_PRIVACY_TIER,
    capture_schema_version: CAPTURE_SCHEMA_VERSION,
    context: { capture: captureBlock },
  };

  if (params.occurred_at) entry.occurred_at = params.occurred_at;
  if (validated.length > 0) entry.evidence_links = validated;

  const data = loadFeedback(basePath);
  data.entries.push(entry);
  const filePath = getFeedbackPath(basePath);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const result = writeCanonicalValueAtomic(filePath, { entries: data.entries });
    if (!result.ok) throw new Error(result.error);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Failed to write feedback file: ${msg}` };
  }

  return {
    ok: true,
    receipt: buildCaptureReceipt(entry, {
      idempotent_replay: false,
      evidence_refs_validated: validated,
      evidence_refs_rejected: rejected,
      impact: params.impact,
    }),
  };
}

/** Normalize MCP/event-shaped input into capture params. */
export function normalizeCaptureInput(raw: Record<string, unknown>): CaptureObservationParams | { error: string } {
  const client = raw.client as Record<string, unknown> | undefined;
  const privacyFromClient =
    client && typeof client.privacy_tier === "string" ? client.privacy_tier : undefined;
  const privacy_tier =
    (typeof raw.privacy_tier === "string" ? raw.privacy_tier : undefined) ?? privacyFromClient ?? "";

  const observation = (raw.observation ?? {}) as Record<string, unknown>;
  const delivery = (raw.delivery ?? {}) as Record<string, unknown>;
  const evidence = (raw.evidence ?? {}) as Record<string, unknown>;

  const title =
    (typeof raw.title === "string" ? raw.title : undefined) ??
    (typeof observation.title === "string" ? observation.title : "");
  const description =
    (typeof raw.description === "string" ? raw.description : undefined) ??
    (typeof observation.description === "string" ? observation.description : "") ??
    (typeof raw.body === "string" ? raw.body : "");

  const idempotency_key =
    (typeof raw.idempotency_key === "string" ? raw.idempotency_key : undefined) ??
    (typeof delivery.idempotency_key === "string" ? delivery.idempotency_key : "");

  const entryTypeRaw = observation.entry_type ?? raw.entry_type;
  let entry_type: FeedbackType | undefined;
  if (entryTypeRaw === "omitted" || entryTypeRaw === undefined || entryTypeRaw === null) {
    entry_type = undefined;
  } else if (typeof entryTypeRaw === "string" && FEEDBACK_TYPES.includes(entryTypeRaw as FeedbackType)) {
    entry_type = entryTypeRaw as FeedbackType;
  } else if (typeof entryTypeRaw === "string") {
    return { error: `Invalid entry type: ${entryTypeRaw}` };
  }

  const refsRaw = evidence.refs ?? raw.evidence_refs;
  const evidence_refs = Array.isArray(refsRaw)
    ? refsRaw.filter((r): r is string => typeof r === "string")
    : undefined;

  return {
    privacy_tier,
    title,
    description,
    idempotency_key,
    occurred_at:
      typeof observation.occurred_at === "string"
        ? observation.occurred_at
        : typeof raw.occurred_at === "string"
          ? raw.occurred_at
          : undefined,
    observation_kind:
      typeof observation.kind === "string"
        ? observation.kind
        : typeof raw.observation_kind === "string"
          ? raw.observation_kind
          : undefined,
    entry_type,
    impact: typeof observation.impact === "string" ? observation.impact : undefined,
    evidence_refs,
    client: client && typeof client === "object" ? client : undefined,
  };
}
