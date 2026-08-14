import crypto from "node:crypto";
import {
  addProposal,
  type LeapProposal,
} from "./analysis/leap-proposal-queue.js";
import type { FeedbackEntry } from "./feedback.js";

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]
// Normalizes operational feedback, groups duplicates, and gates non-canonical LEAP proposal creation on human review.

export const OPERATIONAL_SOURCE_TYPES = ["incident", "metric", "test_failure", "user_report"] as const;
export type OperationalSourceType = (typeof OPERATIONAL_SOURCE_TYPES)[number];
export type PromotionStatus =
  | "promotion_pending"
  | "proposal_created"
  | "canonical_ready"
  | "rejected"
  | "duplicate";

export interface OperationalSource {
  source_type: OperationalSourceType;
  source_id: string;
  affected_feature: string;
  severity: string;
  evidence_links: string[];
  occurred_at: string;
  title: string;
  description: string;
  proposed_req?: string;
  payload?: Record<string, unknown>;
}

export interface OperationalFeedbackEntry extends Omit<FeedbackEntry, "context"> {
  context?: Record<string, unknown>;
  source_type: OperationalSourceType;
  source_id: string;
  affected_feature: string;
  severity: string;
  evidence_links: string[];
  duplicate_group: string;
  proposed_req?: string;
  promotion_status: PromotionStatus;
}

export type FeedbackPromotionError = "InvalidSource" | "MissingEvidence" | "DuplicateConflict" | "ReviewRequired" | "CanonicalWriteAttempt";

function stableGroup(source: Pick<OperationalSource, "source_type" | "affected_feature" | "title" | "description" | "evidence_links" | "proposed_req">): string {
  return `fg-${crypto
    .createHash("sha256")
    .update(JSON.stringify({
      source_type: source.source_type,
      affected_feature: source.affected_feature,
      title: source.title.trim().toLowerCase(),
      description: source.description.trim().toLowerCase(),
      evidence_links: [...source.evidence_links].sort(),
      proposed_req: source.proposed_req ?? null,
    }))
    .digest("hex")
    .slice(0, 16)}`;
}

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Maps supported operational sources to the existing feedback entry contract.
export function normalizeOperationalSource(
  source: OperationalSource,
): { ok: true; entry: OperationalFeedbackEntry } | { ok: false; error: "InvalidSource" | "MissingEvidence" } {
  if (
    !OPERATIONAL_SOURCE_TYPES.includes(source.source_type) ||
    !source.source_id?.trim() ||
    !source.affected_feature?.trim() ||
    !source.severity?.trim() ||
    !source.title?.trim() ||
    !source.description?.trim() ||
    !source.occurred_at?.trim()
  ) {
    return { ok: false, error: "InvalidSource" };
  }
  if (!Array.isArray(source.evidence_links) || source.evidence_links.length === 0 || source.evidence_links.some((link) => !link.trim())) {
    return { ok: false, error: "MissingEvidence" };
  }
  const id = `fb-op-${crypto.createHash("sha256").update(`${source.source_type}:${source.source_id}`).digest("hex").slice(0, 16)}`;
  return {
    ok: true,
    entry: {
      id,
      type: source.source_type === "user_report" ? "feature_request" : "bug_report",
      title: source.title.trim(),
      description: source.description.trim(),
      created_at: source.occurred_at,
      context: source.payload,
      source_type: source.source_type,
      source_id: source.source_id.trim(),
      affected_feature: source.affected_feature.trim(),
      severity: source.severity.trim(),
      evidence_links: [...source.evidence_links],
      duplicate_group: stableGroup(source),
      proposed_req: source.proposed_req,
      promotion_status: "promotion_pending",
    },
  };
}

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Groups equivalent reports deterministically without deleting source history.
export function groupDuplicateFeedback(
  entry: OperationalFeedbackEntry,
  existing: readonly OperationalFeedbackEntry[],
):
  | { kind: "original"; entry: OperationalFeedbackEntry }
  | { kind: "duplicate"; entry: OperationalFeedbackEntry; duplicate_of: string } {
  const match = existing.find((candidate) => candidate.duplicate_group === entry.duplicate_group);
  if (!match) return { kind: "original", entry };
  return {
    kind: "duplicate",
    entry: { ...entry, duplicate_group: match.duplicate_group, promotion_status: "duplicate" },
    duplicate_of: match.id,
  };
}

export interface ReviewDecision {
  reviewer: string;
  decision: "create_proposal" | "reject";
  rationale: string;
  evidence_links: string[];
}

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Creates a distinct non-canonical proposal only after explicit human review.
export function createReviewedLeapProposal(
  entry: OperationalFeedbackEntry,
  options: { projectRoot: string; review?: ReviewDecision; canonicalWrite?: boolean },
): { ok: true; proposal: LeapProposal } | { ok: false; error: "ReviewRequired" | "CanonicalWriteAttempt" } {
  if (options.canonicalWrite) return { ok: false, error: "CanonicalWriteAttempt" };
  const review = options.review;
  if (
    !review ||
    !review.reviewer.trim() ||
    !review.rationale.trim() ||
    review.evidence_links.length === 0 ||
    (review.decision !== "create_proposal" && review.decision !== "reject")
  ) {
    return { ok: false, error: "ReviewRequired" };
  }
  if (review.decision === "reject") {
    return { ok: false, error: "ReviewRequired" };
  }
  const proposal = addProposal(options.projectRoot, {
    kind: "manual",
    title: `Reviewed feedback: ${entry.title}`,
    summary: entry.description,
    source: { type: "manual" },
    suggested_leap_order: "req",
    leap_hints: {
      feedback_id: entry.id,
      affected_feature: entry.affected_feature,
      proposed_req: entry.proposed_req,
      evidence_links: [...entry.evidence_links],
      review,
    },
  });
  return { ok: true, proposal };
}

// [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Reports review and promotion state without implying canonical application.
export function reportPromotionStatus(
  entry: OperationalFeedbackEntry,
  proposal?: Pick<LeapProposal, "status">,
): PromotionStatus {
  if (entry.promotion_status === "duplicate") return "duplicate";
  if (!proposal) return "promotion_pending";
  if (proposal.status === "approved") return "canonical_ready";
  if (proposal.status === "pending") return "proposal_created";
  return "rejected";
}
