import type { FeatureManifest, LifecyclePhase } from "./manifest.js";

export type TransitionResult =
  | { outcome: "allow"; requested_phase: LifecyclePhase }
  | { outcome: "blocked"; reason: "PRECONDITION_UNMET" }
  | { outcome: "approval_required"; reason: "APPROVAL_REQUIRED" }
  | { outcome: "illegal_transition"; reason: "ILLEGAL_TRANSITION" }
  | { outcome: "unknown_phase"; reason: "UNKNOWN_PHASE" };

export type TransitionEvidence = {
  validated?: boolean;
  planned?: boolean;
  tasked?: boolean;
  verified?: boolean;
  dependencies_satisfied?: boolean;
};

const phases = new Set<LifecyclePhase>([
  "draft",
  "refining",
  "specified",
  "planned",
  "tasked",
  "verifying",
  "closed",
  "abandoned",
]);

const legalTransitions = new Map<LifecyclePhase, LifecyclePhase[]>([
  ["draft", ["refining", "abandoned"]],
  ["refining", ["specified", "abandoned"]],
  ["specified", ["planned", "abandoned"]],
  ["planned", ["tasked", "abandoned"]],
  ["tasked", ["verifying", "abandoned"]],
  ["verifying", ["closed", "abandoned"]],
  ["closed", []],
  ["abandoned", []],
]);

function evidenceSatisfied(current: LifecyclePhase, requested: LifecyclePhase, evidence: TransitionEvidence): boolean {
  if (current === "specified" && requested === "planned") return evidence.validated === true;
  if (current === "planned" && requested === "tasked") return evidence.planned === true;
  if (current === "tasked" && requested === "verifying") return evidence.tasked === true;
  if (current === "verifying" && requested === "closed") return evidence.verified === true;
  return true;
}

// [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: encode draft → refining → specified → planned → tasked → verifying → closed and terminal abandoned.
export function evaluateTransition(
  currentPhase: string,
  requestedPhase: string,
  validationEvidence: TransitionEvidence,
  approvalContext: { approved?: boolean }
): TransitionResult {
  if (!phases.has(currentPhase as LifecyclePhase) || !phases.has(requestedPhase as LifecyclePhase)) {
    return { outcome: "unknown_phase", reason: "UNKNOWN_PHASE" };
  }
  const current = currentPhase as LifecyclePhase;
  const requested = requestedPhase as LifecyclePhase;
  if (!legalTransitions.get(current)?.includes(requested)) {
    return { outcome: "illegal_transition", reason: "ILLEGAL_TRANSITION" };
  }
  if (requested === "abandoned" && approvalContext.approved !== true) {
    return { outcome: "approval_required", reason: "APPROVAL_REQUIRED" };
  }
  if (!evidenceSatisfied(current, requested, validationEvidence)) {
    return { outcome: "blocked", reason: "PRECONDITION_UNMET" };
  }
  return { outcome: "allow", requested_phase: requested };
}

// [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: apply an allowed transition as one immutable revision.
export function applyAcceptedTransition(
  manifest: FeatureManifest,
  transition: TransitionResult
):
  | { ok: true; manifest: FeatureManifest }
  | { ok: false; error: "TRANSITION_NOT_ALLOWED" | "INVALID_REVISION" } {
  if (transition.outcome !== "allow") return { ok: false, error: "TRANSITION_NOT_ALLOWED" };
  if (!Number.isInteger(manifest.revision) || manifest.revision < 1) {
    return { ok: false, error: "INVALID_REVISION" };
  }
  return {
    ok: true,
    manifest: {
      ...manifest,
      status: transition.requested_phase,
      revision: manifest.revision + 1,
      canonical_tokens: {
        requirements: [...manifest.canonical_tokens.requirements],
        architecture: [...manifest.canonical_tokens.architecture],
        implementations: [...manifest.canonical_tokens.implementations],
      },
    },
  };
}
