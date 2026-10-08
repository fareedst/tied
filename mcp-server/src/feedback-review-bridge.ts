/**
 * Kaizen Phase 5 digest finding → reviewed LEAP proposal handoff.
 * [REQ-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [IMPL-KAIZEN-REVIEW-BRIDGE]
 */

import { getQueuePath } from "./analysis/leap-proposal-queue.js";
import type { LeapProposal } from "./analysis/leap-proposal-queue.js";
import {
  computeProjectionHash,
  type DuplicateGroupSummary,
  type FeedbackAnalysisDigestV1,
} from "./feedback-analysis.js";
import {
  createReviewedLeapProposal,
  reportPromotionStatus,
  type OperationalFeedbackEntry,
  type PromotionStatus,
  type ReviewDecision,
} from "./feedback-promotion.js";

export type ReviewBridgeError =
  | "InvalidFinding"
  | "StaleEvidence"
  | "ReviewRequired"
  | "CanonicalWriteAttempt"
  | "MissingEntry";

export interface ReviewBridgeContext {
  projection_hash?: string;
}

export interface ProposalLink {
  proposal_id: string;
  queue_path: string;
}

export interface ReviewBridgeSuccess {
  ok: true;
  lead_entry_id: string;
  member_ids: string[];
  promotion_status: PromotionStatus;
  review_outcome: "approved" | "rejected";
  proposal_link?: ProposalLink;
  proposal?: LeapProposal;
}

export type ReviewBridgeResult = ReviewBridgeSuccess | { ok: false; error: ReviewBridgeError };

export interface RunDigestReviewBridgeParams {
  digest: FeedbackAnalysisDigestV1;
  observation_group: string;
  review?: ReviewDecision;
  review_context?: ReviewBridgeContext;
  projectRoot: string;
  entriesById: ReadonlyMap<string, OperationalFeedbackEntry>;
  canonicalWrite?: boolean;
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Map digest finding observation_group to existing feedback entry ids.
export function resolveFindingToEntryIds(
  digest: FeedbackAnalysisDigestV1,
  observation_group: string,
): { ok: true; lead_entry_id: string; member_ids: string[] } | { ok: false; error: "InvalidFinding" } {
  const groups = digest.observations.duplicate_groups ?? [];
  const match = groups.find((group) => group.duplicate_group === observation_group);
  if (!match || match.member_ids.length === 0) {
    return { ok: false, error: "InvalidFinding" };
  }
  return {
    ok: true,
    lead_entry_id: match.member_ids[0]!,
    member_ids: [...match.member_ids],
  };
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Reject review when digest projection_hash anchor is stale.
export function validateDigestEvidenceFreshness(
  review_context: ReviewBridgeContext | undefined,
  current_projection_hash: string,
): { ok: true } | { ok: false; error: "StaleEvidence" } {
  const anchor = review_context?.projection_hash?.trim();
  if (!anchor) return { ok: true };
  if (anchor !== current_projection_hash) return { ok: false, error: "StaleEvidence" };
  return { ok: true };
}

function reviewDecisionValid(review: ReviewDecision | undefined): review is ReviewDecision {
  if (!review) return false;
  if (!review.reviewer.trim() || !review.rationale.trim()) return false;
  if (!Array.isArray(review.evidence_links) || review.evidence_links.length === 0) return false;
  if (review.evidence_links.some((link) => !link.trim())) return false;
  return review.decision === "create_proposal" || review.decision === "reject";
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-KAIZEN-REVIEW-BRIDGE] — Validate human review envelope before promotion handoff.
export function applyDigestReviewDecision(
  review: ReviewDecision | undefined,
): { ok: true; authorized: "create_proposal" | "reject" } | { ok: false; error: "ReviewRequired" } {
  if (!reviewDecisionValid(review)) return { ok: false, error: "ReviewRequired" };
  return { ok: true, authorized: review.decision };
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Delegate to existing createReviewedLeapProposal; block canonical write attempts.
export function bridgeCreateReviewedLeapProposal(
  entry: OperationalFeedbackEntry,
  options: {
    projectRoot: string;
    review: ReviewDecision;
    canonicalWrite?: boolean;
    projection_hash: string;
    member_ids: string[];
  },
): { ok: true; proposal: LeapProposal; proposal_link: ProposalLink } | { ok: false; error: "ReviewRequired" | "CanonicalWriteAttempt" } {
  if (options.canonicalWrite) return { ok: false, error: "CanonicalWriteAttempt" };
  const created = createReviewedLeapProposal(entry, {
    projectRoot: options.projectRoot,
    review: options.review,
    canonicalWrite: false,
    leap_hints_extra: {
      digest_projection_hash: options.projection_hash,
      member_ids: [...options.member_ids],
    },
  });
  if (!created.ok) return created;
  const queue_path = getQueuePath(options.projectRoot);
  return {
    ok: true,
    proposal: created.proposal,
    proposal_link: { proposal_id: created.proposal.id, queue_path },
  };
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Surface promotion status and proposal link without implying canonical apply.
export function buildReviewBridgeResult(
  lead: OperationalFeedbackEntry,
  member_ids: string[],
  review_outcome: "approved" | "rejected",
  proposal?: LeapProposal,
  proposal_link?: ProposalLink,
): ReviewBridgeSuccess {
  return {
    ok: true,
    lead_entry_id: lead.id,
    member_ids: [...member_ids],
    promotion_status: reportPromotionStatus(lead, proposal),
    review_outcome,
    ...(proposal_link ? { proposal_link } : {}),
    ...(proposal ? { proposal } : {}),
  };
}

// [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Primary entry orchestrating finding resolution, freshness, review, and LEAP handoff.
export function runDigestReviewBridge(params: RunDigestReviewBridgeParams): ReviewBridgeResult {
  const resolved = resolveFindingToEntryIds(params.digest, params.observation_group);
  if (!resolved.ok) return resolved;

  const lead = params.entriesById.get(resolved.lead_entry_id);
  if (!lead) return { ok: false, error: "MissingEntry" };

  const projection_hash = computeProjectionHash(params.digest);
  const fresh = validateDigestEvidenceFreshness(params.review_context, projection_hash);
  if (!fresh.ok) return fresh;

  const decision = applyDigestReviewDecision(params.review);
  if (!decision.ok) return decision;

  if (decision.authorized === "reject") {
    return buildReviewBridgeResult(lead, resolved.member_ids, "rejected");
  }

  const review = params.review!;
  const promoted = bridgeCreateReviewedLeapProposal(lead, {
    projectRoot: params.projectRoot,
    review,
    canonicalWrite: params.canonicalWrite,
    projection_hash,
    member_ids: resolved.member_ids,
  });
  if (!promoted.ok) return promoted;

  return buildReviewBridgeResult(
    lead,
    resolved.member_ids,
    "approved",
    promoted.proposal,
    promoted.proposal_link,
  );
}

/** Test helper: duplicate_group summaries from digest for fixture authoring. */
export type { DuplicateGroupSummary };
