/**
 * [IMPL-ASYNC_CITDP_PROFILE_WIRING] [ARCH-ASYNC_CITDP_EVIDENCE] [REQ-ASYNC_CITDP_TRIGGERS]
 * CITDP candidate trigger derivation, evidence matrix, and inquiry activation contract (W3).
 */
import type { AsyncSemanticClass } from "./checklist-async-dispositions.js";

export type AsyncEvidenceMatrixRow = {
  attribute: string;
  evidence_artifact: string;
  proof_boundary: string;
  minimum_acceptance: string;
};

export type AsyncCitdpTriggerId =
  | "async-boundary-catalog"
  | "composition-async-seam"
  | "retry-idempotency-evidence"
  | "timeout-cancellation-evidence"
  | "stateful-reliability";

export type AsyncCitdpCandidateTrigger = {
  trigger_id: AsyncCitdpTriggerId;
  profile_recommendation?: "minimal" | "integrated";
  test_strategy_row?: string;
  evidence_attributes: string[];
  rationale: string;
  candidate_only: true;
};

export type AsyncInquiryCaseId =
  | "ASYNC-001"
  | "ASYNC-002"
  | "ASYNC-003"
  | "ASYNC-004"
  | "ASYNC-005"
  | "ASYNC-006";

export type AsyncInquiryCase = {
  case_id: AsyncInquiryCaseId;
  description: string;
  semantic_class: AsyncSemanticClass;
};

export type AsyncCitdpActivationDisposition = {
  depth_tier: "minimal" | "integrated" | "strict_candidate";
  research_profile?: string;
  assurance_profile?: string;
  gate_policy: "advisory" | "blocking";
  matched_triggers: string[];
  selected_cases: AsyncInquiryCaseId[];
  owner: string;
  expiry: string;
  waiver?: {
    rationale: string;
    owner: string;
    expiry: string;
  };
};

export type AsyncCitdpActivationResult = {
  ok: boolean;
  allowed: boolean;
  diagnostics: string[];
};

const ASYNC_EFFECTS_PATTERN = /EFFECTS:[^\n]*\bAsync\b/i;
const ASYNC_BOUNDARY_PATTERN = /\bAWAIT\b|\bSEND\b|Promise|ASYNC_BOUNDARY:/i;

// [ARCH-ASYNC_CITDP_EVIDENCE] [REQ-ASYNC_CITDP_TRIGGERS] — How: plan § W3 evidence matrix rows.
export const ASYNC_CITDP_EVIDENCE_MATRIX: readonly AsyncEvidenceMatrixRow[] = [
  {
    attribute: "async-boundary-catalog",
    evidence_artifact: "Phase B catalog table in Tracker",
    proof_boundary: "Structural completeness",
    minimum_acceptance: "One row for every changed async block",
  },
  {
    attribute: "async-await-sequencing",
    evidence_artifact: "IMPL SEQUENCING/CONTROL + unit tests",
    proof_boundary: "Documented local ordering",
    minimum_acceptance: "Success and failure continuation named",
  },
  {
    attribute: "async-delivery",
    evidence_artifact: "MESSAGE_CONTRACT + composition test",
    proof_boundary: "Declared delivery/ack behavior",
    minimum_acceptance: "Delivery category and duplicate/loss outcome named",
  },
  {
    attribute: "async-cancellation",
    evidence_artifact: "CANCELLATION + unit test",
    proof_boundary: "Named cancellation POST",
    minimum_acceptance: "Caller, cancellation point, and DATA outcome named",
  },
  {
    attribute: "async-timeout-recovery",
    evidence_artifact: "TIMEOUT/FAILURE_MODES + unit test",
    proof_boundary: "Named failure path exercised",
    minimum_acceptance: "Deadline and timeout consequence match",
  },
  {
    attribute: "async-retry-idempotency",
    evidence_artifact: "RETRY/IDEMPOTENCY + duplicate test",
    proof_boundary: "Re-execution behavior",
    minimum_acceptance: "Retryable failures and deduplication key/outcome named",
  },
  {
    attribute: "async-shared-data",
    evidence_artifact: "DATA_TRANSITION + collision report",
    proof_boundary: "Structural ownership/order",
    minimum_acceptance: "Reads, writes, and ordering edges named",
  },
  {
    attribute: "async-termination",
    evidence_artifact: "TERMINATION + close/unsubscribe test",
    proof_boundary: "Declared completion/open wait",
    minimum_acceptance: "Close condition or may_diverge rationale",
  },
  {
    attribute: "async-composition-seam",
    evidence_artifact: "Binding inventory row + composition test",
    proof_boundary: "Trigger-to-effect boundary",
    minimum_acceptance: "Async PRE/POST exercised without UI",
  },
] as const;

// [REQ-ASYNC_CITDP_TRIGGERS] — How: integrated adversarial inquiry cases from plan § W3.
export const ASYNC_INQUIRY_CASES: readonly AsyncInquiryCase[] = [
  {
    case_id: "ASYNC-001",
    description: "Timeout declared in REQ, absent in IMPL",
    semantic_class: "timeout",
  },
  {
    case_id: "ASYNC-002",
    description: "Two AWAITs on shared mutable DATA without DATA_TRANSITION ordering",
    semantic_class: "shared_data",
  },
  {
    case_id: "ASYNC-003",
    description: "SEND without idempotency when MESSAGE_CONTRACT at-least-once",
    semantic_class: "message_event_delivery",
  },
  {
    case_id: "ASYNC-004",
    description: "Composition binding missing ordering for async handler",
    semantic_class: "await_sequencing",
  },
  {
    case_id: "ASYNC-005",
    description: "Cancellation is declared but no post-cancel DATA outcome is specified",
    semantic_class: "cancellation",
  },
  {
    case_id: "ASYNC-006",
    description: "Open wait has no close/unsubscribe path or may_diverge rationale",
    semantic_class: "termination",
  },
] as const;

const VALID_INQUIRY_CASE_IDS = new Set(ASYNC_INQUIRY_CASES.map((entry) => entry.case_id));

function hasAsyncBoundaryInPseudocode(pseudocode?: string): boolean {
  if (!pseudocode) return false;
  return ASYNC_EFFECTS_PATTERN.test(pseudocode) || ASYNC_BOUNDARY_PATTERN.test(pseudocode);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueTriggers(triggers: AsyncCitdpCandidateTrigger[]): AsyncCitdpCandidateTrigger[] {
  const seen = new Set<string>();
  return triggers.filter((trigger) => {
    if (seen.has(trigger.trigger_id)) return false;
    seen.add(trigger.trigger_id);
    return true;
  });
}

/**
 * [IMPL-ASYNC_CITDP_PROFILE_WIRING] [ARCH-ASYNC_CITDP_EVIDENCE] — How: map async attribute rows by id.
 */
export function getAsyncEvidenceMatrixRow(attribute: string): AsyncEvidenceMatrixRow | undefined {
  return ASYNC_CITDP_EVIDENCE_MATRIX.find((row) => row.attribute === attribute);
}

/**
 * [IMPL-ASYNC_CITDP_PROFILE_WIRING] [REQ-ASYNC_CITDP_TRIGGERS] — How: consume W2 async_in_scope and emit candidate triggers only.
 */
export function deriveAsyncCitdpTriggers(input: {
  async_in_scope: boolean;
  matched_semantic_classes: AsyncSemanticClass[];
  pseudocode?: string;
  req_criteria?: {
    retry?: boolean;
    at_least_once_delivery?: boolean;
    timeout?: boolean;
    cancellation?: boolean;
  };
  composition_bindings?: Array<{ kind: string; handler?: string }>;
  mutates_persistence?: boolean;
  behavior_change?: boolean;
}): AsyncCitdpCandidateTrigger[] {
  if (!input.async_in_scope) return [];

  const triggers: AsyncCitdpCandidateTrigger[] = [];
  const behaviorChange = input.behavior_change ?? true;

  if (hasAsyncBoundaryInPseudocode(input.pseudocode) || input.matched_semantic_classes.length > 0) {
    triggers.push({
      trigger_id: "async-boundary-catalog",
      profile_recommendation: behaviorChange ? "integrated" : "minimal",
      evidence_attributes: ["async-boundary-catalog"],
      rationale: "In-scope IMPL with Async EFFECTS or async boundary row requires catalog-async-boundaries disposition.",
      candidate_only: true,
    });
  }

  const hasCompositionSeam = (input.composition_bindings ?? []).some((binding) =>
    /^(SEND|IPC|event-handler)$/i.test(binding.kind.trim()),
  ) || input.matched_semantic_classes.includes("message_event_delivery")
    && /\bSEND\b|\bON\b|\bWHEN\b/i.test(input.pseudocode ?? "");
  if (hasCompositionSeam) {
    triggers.push({
      trigger_id: "composition-async-seam",
      test_strategy_row: "composition-async-seam",
      evidence_attributes: ["async-composition-seam", "async-delivery"],
      rationale: "SEND/IPC/event-handler composition binding requires async seam test-strategy row.",
      candidate_only: true,
    });
  }

  const retryCriteria = input.req_criteria?.retry === true
    || input.matched_semantic_classes.includes("retry_idempotency");
  const atLeastOnce = input.req_criteria?.at_least_once_delivery === true
    || /at-least-once/i.test(input.pseudocode ?? "");
  if (retryCriteria || atLeastOnce) {
    triggers.push({
      trigger_id: "retry-idempotency-evidence",
      evidence_attributes: ["async-retry-idempotency", "async-delivery"],
      rationale: "Retry or at-least-once delivery criteria require duplicate-delivery and idempotency evidence.",
      candidate_only: true,
    });
  }

  const timeoutOrCancel = input.req_criteria?.timeout === true
    || input.req_criteria?.cancellation === true
    || input.matched_semantic_classes.includes("timeout")
    || input.matched_semantic_classes.includes("cancellation");
  if (timeoutOrCancel) {
    triggers.push({
      trigger_id: "timeout-cancellation-evidence",
      evidence_attributes: ["async-timeout-recovery", "async-cancellation"],
      rationale: "Timeout or cancellation criteria require slow-provider and cancellation-outcome evidence.",
      candidate_only: true,
    });
  }

  if (input.matched_semantic_classes.includes("shared_data") && input.mutates_persistence === true) {
    triggers.push({
      trigger_id: "stateful-reliability",
      evidence_attributes: ["async-shared-data"],
      rationale: "Shared persistent DATA crossing a yield with persistence mutation requires stateful-reliability disposition.",
      candidate_only: true,
    });
  }

  if (input.matched_semantic_classes.includes("await_sequencing")) {
    const catalog = triggers.find((trigger) => trigger.trigger_id === "async-boundary-catalog");
    if (catalog) {
      catalog.evidence_attributes = [...new Set([...catalog.evidence_attributes, "async-await-sequencing"])];
    }
  }
  if (input.matched_semantic_classes.includes("termination")) {
    const catalog = triggers.find((trigger) => trigger.trigger_id === "async-boundary-catalog");
    if (catalog) {
      catalog.evidence_attributes = [...new Set([...catalog.evidence_attributes, "async-termination"])];
    }
  }

  return uniqueTriggers(triggers);
}

/**
 * [IMPL-ASYNC_CITDP_PROFILE_WIRING] [REQ-ASYNC_CITDP_TRIGGERS] — How: explicit activation contract before tied_adversarial_inquiry_run.
 */
export function validateAsyncCitdpActivation(input: {
  async_in_scope?: boolean;
  disposition?: Partial<AsyncCitdpActivationDisposition> | null;
  inquiry_requested?: boolean;
}): AsyncCitdpActivationResult {
  const diagnostics: string[] = [];

  if (!input.inquiry_requested) {
    return { ok: true, allowed: false, diagnostics };
  }

  if (input.async_in_scope === true && !input.disposition) {
    diagnostics.push("async_in_scope_alone_does_not_authorize_inquiry");
    return { ok: false, allowed: false, diagnostics };
  }

  const disposition = input.disposition;
  if (!disposition || typeof disposition !== "object") {
    diagnostics.push("activation_disposition_missing");
    return { ok: false, allowed: false, diagnostics };
  }

  const depth = disposition.depth_tier;
  if (!depth || !["minimal", "integrated", "strict_candidate"].includes(depth)) {
    diagnostics.push("activation_depth_tier_missing");
  }

  if (!nonEmpty(disposition.research_profile)) diagnostics.push("activation_research_profile_missing");
  if (!nonEmpty(disposition.assurance_profile)) diagnostics.push("activation_assurance_profile_missing");
  if (!disposition.gate_policy || !["advisory", "blocking"].includes(disposition.gate_policy)) {
    diagnostics.push("activation_gate_policy_missing");
  }
  if (!Array.isArray(disposition.matched_triggers) || disposition.matched_triggers.length === 0) {
    diagnostics.push("activation_matched_triggers_missing");
  }
  if (!Array.isArray(disposition.selected_cases) || disposition.selected_cases.length === 0) {
    diagnostics.push("activation_selected_cases_missing");
  } else {
    for (const caseId of disposition.selected_cases) {
      if (!VALID_INQUIRY_CASE_IDS.has(caseId as AsyncInquiryCaseId)) {
        diagnostics.push(`invalid_inquiry_case:${caseId}`);
      }
    }
  }
  if (!nonEmpty(disposition.owner)) diagnostics.push("activation_owner_missing");
  if (!nonEmpty(disposition.expiry)) diagnostics.push("activation_expiry_missing");

  const allowed = diagnostics.length === 0;
  return {
    ok: allowed,
    allowed,
    diagnostics: [...new Set(diagnostics)],
  };
}
