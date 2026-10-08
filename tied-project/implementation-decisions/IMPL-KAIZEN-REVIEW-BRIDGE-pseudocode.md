# [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-FEEDBACK-ANALYSIS] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] [REQ-LEAP_PROPOSAL_QUEUE]
# Digest finding → existing feedback ids → human review → existing createReviewedLeapProposal path; no second queue; no canonical YAML write.

Grammar-Version: v2

## Summary contract
INPUT: feedback-analysis.v1 digest, observation_group (finding key), human ReviewDecision, optional projection_hash anchor, projectRoot
PRE: digest is a projection only; promotion uses existing leap-proposals queue and createReviewedLeapProposal boundary
OUTPUT: review bridge result with linked entry ids, proposal link, or structured error (ReviewRequired, CanonicalWriteAttempt, StaleEvidence)
POST: feedback.yaml and project TIED YAML unchanged; at most one non-canonical proposal append via existing queue lifecycle
FAILURE_MODES: ReviewRequired, CanonicalWriteAttempt, StaleEvidence, InvalidFinding, MissingEntry
EFFECTS: IO on leap-proposals queue only when review authorizes create_proposal; read IO on digest and feedback load path
TERMINATION: total

## RESOLVE_FINDING_TO_ENTRY_IDS
# [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Map digest finding observation_group to existing feedback entry ids.
Contract:
  INPUT: digest observations.duplicate_groups[], finding observation_group
  PRE: observation_group equals duplicate_group id from Phase 4 digest
  OUTPUT: { lead_entry_id, member_ids[] } | error InvalidFinding
  POST: ids reference existing entries only; no synthetic ids
  FAILURE_MODES: InvalidFinding
  EFFECTS: pure
  TERMINATION: total
  LOCATE duplicate_group where duplicate_group == observation_group
  IF not found: RETURN InvalidFinding
  SET lead_entry_id to first member_id
  RETURN lead_entry_id and full member_ids list

## VALIDATE_DIGEST_EVIDENCE_FRESHNESS
# [IMPL-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Reject review when digest projection_hash anchor is stale.
Contract:
  INPUT: review_context.projection_hash, current_digest projection_hash from computeProjectionHash
  PRE: reviewer supplied anchor when digest was read for decision
  OUTPUT: ok | error StaleEvidence
  POST: stale reviews never append proposals
  FAILURE_MODES: StaleEvidence
  EFFECTS: pure
  TERMINATION: total
  IF review_context.projection_hash missing: RETURN ok (explicit waiver path for tests only)
  IF review_context.projection_hash != current_digest.projection_hash: RETURN StaleEvidence
  RETURN ok

## APPLY_DIGEST_REVIEW_DECISION
# [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-KAIZEN-REVIEW-BRIDGE] — Validate human review envelope before promotion handoff.
Contract:
  INPUT: ReviewDecision { reviewer, decision, rationale, evidence_links[] }
  PRE: decision is create_proposal or reject; reviewer and rationale non-empty; evidence_links non-empty
  OUTPUT: authorized create_proposal | reject outcome | error ReviewRequired
  POST: reject returns ReviewRequired without queue mutation
  FAILURE_MODES: ReviewRequired
  EFFECTS: pure
  TERMINATION: total
  IF review missing or invalid fields: RETURN ReviewRequired
  IF decision == reject: RETURN reject outcome with ReviewRequired semantics for caller
  IF decision == create_proposal: RETURN authorized
  RETURN ReviewRequired

## BRIDGE_CREATE_REVIEWED_LEAP_PROPOSAL
# [IMPL-KAIZEN-REVIEW-BRIDGE] [IMPL-TIED_FEEDBACK_PROMOTION] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Delegate to existing createReviewedLeapProposal; block canonical write attempts.
Contract:
  INPUT: operational lead entry, ReviewDecision, projectRoot, canonicalWrite flag
  PRE: lead entry satisfies OperationalFeedbackEntry shape; queue is sole promotion surface
  OUTPUT: { proposal } | error ReviewRequired | error CanonicalWriteAttempt
  POST: proposal.leap_hints includes feedback_id, digest projection_hash, member_ids; non_canonical true
  FAILURE_MODES: ReviewRequired, CanonicalWriteAttempt
  DATA: leap-proposals queue
  DATA_TRANSITION: append non-canonical proposal only
  EFFECTS: IO State
  TERMINATION: total
  IF canonicalWrite true: RETURN CanonicalWriteAttempt
  CALL createReviewedLeapProposal(entry, { projectRoot, review, canonicalWrite: false })
  IF error: RETURN error
  ATTACH proposal_link { proposal_id, queue_path } to result
  RETURN proposal

## BUILD_REVIEW_BRIDGE_RESULT
# [IMPL-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Surface promotion status and proposal link without implying canonical apply.
Contract:
  INPUT: lead entry, optional proposal, review outcome
  PRE: reportPromotionStatus remains read-only derivation
  OUTPUT: { member_ids, promotion_status, proposal_link?, review_outcome }
  POST: canonical_ready means approved non-canonical proposal exists; separate explicit TIED YAML action still required
  EFFECTS: pure
  TERMINATION: total
  COMPUTE promotion_status via reportPromotionStatus
  IF proposal present: SET proposal_link from queue entry id
  RETURN structured bridge result

## RUN_DIGEST_REVIEW_BRIDGE
# [IMPL-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-REVIEW-BRIDGE] — Primary entry orchestrating finding resolution, freshness, review, and LEAP handoff.
Contract:
  INPUT: digest, observation_group, review, projectRoot, loaded operational entries by id
  PRE: digest produced by buildFeedbackDigest read-only path
  OUTPUT: BUILD_REVIEW_BRIDGE_RESULT payload | structured error
  POST: no feedback.yaml mutation; no requirements.yaml write
  FAILURE_MODES: InvalidFinding, StaleEvidence, ReviewRequired, CanonicalWriteAttempt, MissingEntry
  EFFECTS: read + conditional queue append
  TERMINATION: total
  CALL RESOLVE_FINDING_TO_ENTRY_IDS
  LOAD lead operational entry from map
  IF missing operational shape: RETURN MissingEntry
  CALL VALIDATE_DIGEST_EVIDENCE_FRESHNESS
  CALL APPLY_DIGEST_REVIEW_DECISION
  IF reject authorized: RETURN reject result without queue IO
  CALL BRIDGE_CREATE_REVIEWED_LEAP_PROPOSAL
  CALL BUILD_REVIEW_BRIDGE_RESULT
  RETURN result
