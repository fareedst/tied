/**
 * [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]
 * [ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]
 * [REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]
 */

import {
  computeProjectionHash,
  type FeedbackAnalysisDigestV1,
} from "../feedback-analysis.js";
import { loadFeedback, type FeedbackEntry, type FeedbackType } from "../feedback.js";
import {
  resolveFindingToEntryIds,
  validateDigestEvidenceFreshness,
} from "../feedback-review-bridge.js";
import {
  BRIDGE_PROOF_BOUNDARY,
  BRIDGE_REPORT_SCHEMA_VERSION,
  DEFAULT_BRIDGE_PRIVACY_TIER,
  DEFAULT_BRIDGE_PRODUCTION_SYSTEM_SURFACE,
  METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
} from "./constants.js";

export type BridgeDiagnostic = { code: string; message: string };

export type MethodologyKaizenExperimentBridgeInput = {
  feedback_ids?: string[];
  observation_group?: string;
  digest?: FeedbackAnalysisDigestV1;
  digest_projection_hash?: string;
  production_system_surface?: string;
  base_path?: string;
};

export type MethodologyKaizenExperimentBridgeReport = {
  schema_version: typeof BRIDGE_REPORT_SCHEMA_VERSION;
  ok: boolean;
  draft: Record<string, unknown> | null;
  proof_boundary: string;
  diagnostics: BridgeDiagnostic[];
};

const ELIGIBLE_TYPE: FeedbackType = "methodology_improvement";

function buildHypothesis(title: string, description: string): string {
  const t = title.trim();
  const d = description.trim();
  if (t && d) return `${t} — ${d}`;
  return t || d;
}

function buildBaselineFromContext(context: Record<string, unknown> | undefined): Record<string, unknown> {
  const baselineRef = context?.baseline_ref;
  if (typeof baselineRef === "string" && baselineRef.trim()) {
    return {
      metric_rows: [{ name: "bridge_context_baseline_ref", value: baselineRef.trim() }],
    };
  }
  return {
    metric_rows: [{ name: "bridge_default_baseline", value: "not_measured" }],
  };
}

function entryEligible(entry: FeedbackEntry): boolean {
  return entry.type === ELIGIBLE_TYPE;
}

export function buildExperimentDraftFromFeedbackEntries(
  entries: FeedbackEntry[],
  options: {
    production_system_surface?: string;
    digest_projection_hash?: string;
    observation_group?: string;
  },
): MethodologyKaizenExperimentBridgeReport {
  const diagnostics: BridgeDiagnostic[] = [];
  if (entries.length === 0) {
    diagnostics.push({ code: "NO_ELIGIBLE_FEEDBACK", message: "No bridge-eligible feedback entries supplied." });
    return {
      schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
      ok: false,
      draft: null,
      proof_boundary: BRIDGE_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  for (const entry of entries) {
    if (!entryEligible(entry)) {
      diagnostics.push({
        code: "INELIGIBLE_FEEDBACK_TYPE",
        message: `Entry ${entry.id} has type ${entry.type}; required ${ELIGIBLE_TYPE}.`,
      });
    }
  }
  if (diagnostics.some((d) => d.code === "INELIGIBLE_FEEDBACK_TYPE")) {
    return {
      schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
      ok: false,
      draft: null,
      proof_boundary: BRIDGE_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  const lead = entries[0]!;
  const hypothesis = buildHypothesis(lead.title, lead.description);
  if (!hypothesis) {
    diagnostics.push({ code: "EMPTY_HYPOTHESIS", message: "Title and description are empty." });
    return {
      schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
      ok: false,
      draft: null,
      proof_boundary: BRIDGE_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  const surface = options.production_system_surface?.trim() || DEFAULT_BRIDGE_PRODUCTION_SYSTEM_SURFACE;
  const draft: Record<string, unknown> = {
    schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
    source_feedback_refs: entries.map((e) => e.id),
    methodology_hypothesis: hypothesis,
    methodology_baseline: buildBaselineFromContext(lead.context),
    proof_boundary: BRIDGE_PROOF_BOUNDARY,
    privacy_tier: lead.privacy_tier?.trim() || DEFAULT_BRIDGE_PRIVACY_TIER,
    production_system_surface: surface,
  };

  if (options.observation_group?.trim()) {
    draft.observation_group = options.observation_group.trim();
  }
  if (options.digest_projection_hash?.trim()) {
    draft.digest_projection_hash = options.digest_projection_hash.trim();
  }

  return {
    schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
    ok: true,
    draft,
    proof_boundary: BRIDGE_PROOF_BOUNDARY,
    diagnostics,
  };
}

export function runMethodologyKaizenExperimentBridge(
  input: MethodologyKaizenExperimentBridgeInput,
): MethodologyKaizenExperimentBridgeReport {
  const diagnostics: BridgeDiagnostic[] = [];
  const basePath = input.base_path;

  let feedbackIds = [...(input.feedback_ids ?? [])];

  if (input.observation_group?.trim()) {
    if (!input.digest) {
      diagnostics.push({
        code: "MISSING_DIGEST",
        message: "observation_group requires digest payload.",
      });
      return {
        schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
        ok: false,
        draft: null,
        proof_boundary: BRIDGE_PROOF_BOUNDARY,
        diagnostics,
      };
    }
    const resolved = resolveFindingToEntryIds(input.digest, input.observation_group.trim());
    if (!resolved.ok) {
      diagnostics.push({ code: "INVALID_OBSERVATION_GROUP", message: "observation_group not found in digest." });
      return {
        schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
        ok: false,
        draft: null,
        proof_boundary: BRIDGE_PROOF_BOUNDARY,
        diagnostics,
      };
    }
    feedbackIds = [...new Set([...feedbackIds, ...resolved.member_ids])];
  }

  if (input.digest && input.digest_projection_hash?.trim()) {
    const currentHash = computeProjectionHash(input.digest);
    const fresh = validateDigestEvidenceFreshness(
      { projection_hash: input.digest_projection_hash.trim() },
      currentHash,
    );
    if (!fresh.ok) {
      diagnostics.push({ code: "STALE_DIGEST_HASH", message: "digest_projection_hash does not match live digest." });
      return {
        schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
        ok: false,
        draft: null,
        proof_boundary: BRIDGE_PROOF_BOUNDARY,
        diagnostics,
      };
    }
  }

  if (feedbackIds.length === 0) {
    diagnostics.push({ code: "MISSING_FEEDBACK_IDS", message: "Provide feedback_ids or observation_group with digest." });
    return {
      schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
      ok: false,
      draft: null,
      proof_boundary: BRIDGE_PROOF_BOUNDARY,
      diagnostics,
    };
  }

  const store = loadFeedback(basePath);
  const byId = new Map(store.entries.map((e) => [e.id, e]));
  const entries: FeedbackEntry[] = [];
  for (const id of feedbackIds) {
    const entry = byId.get(id);
    if (!entry) {
      diagnostics.push({ code: "FEEDBACK_NOT_FOUND", message: `No feedback entry for id ${id}.` });
      return {
        schema_version: BRIDGE_REPORT_SCHEMA_VERSION,
        ok: false,
        draft: null,
        proof_boundary: BRIDGE_PROOF_BOUNDARY,
        diagnostics,
      };
    }
    entries.push(entry);
  }

  const report = buildExperimentDraftFromFeedbackEntries(entries, {
    production_system_surface: input.production_system_surface,
    digest_projection_hash: input.digest_projection_hash,
    observation_group: input.observation_group,
  });
  return {
    ...report,
    diagnostics: [...diagnostics, ...report.diagnostics],
  };
}
