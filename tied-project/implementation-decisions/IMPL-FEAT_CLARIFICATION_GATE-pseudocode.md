# [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Project clarification records into deterministic phase blockers.
Contract:
  INPUT: feature_revision: int where feature_revision >= 0; clarification records; requested phase and artifact scope
  OUTPUT: readiness result with blockers and evidence
  DATA: phase/blocking classification and resolution revision
  PRE: records are normalized
  POST: only intersecting open or stale blocking records block
  EFFECTS: pure
  FAILURE_MODES: invalid phase, malformed record
  DATA_TRANSITION: records -> readiness projection
  TERMINATION: total

procedure EVALUATE_CLARIFICATION_GATE(feature_revision, requested_phase, affected_artifacts):
  # [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — How: Classify informational and phase-blocking uncertainty without mutation.
  Contract:
    INPUT: feature_revision: int where feature_revision >= 0; requested_phase; affected_artifacts
    PRE: phase and artifact scope are known
    OUTPUT: sorted blockers
    POST: informational records do not block; open/stale intersecting records do
    EFFECTS: pure
    FAILURE_MODES: unsupported phase or scope
    DATA_TRANSITION: candidate records -> filtered blockers
    TERMINATION: total
  FOR each record, mark a resolved record stale when its resolution_revision is older than a relevant feature revision
  IGNORE informational records for blocking
  SELECT open or stale records whose classification and affected scope intersect the request
  SORT by phase, record id, and blocking class
  RETURN sorted blockers

procedure RESOLUTION_OWNERSHIP_CHECK(record, actor, decision_evidence):
  # [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — How: Require authorized ownership and durable evidence for resolution.
  Contract:
    INPUT: record; actor: string where length(actor) > 0; decision_evidence
    PRE: actor identity is available
    OUTPUT: accepted resolution | authorization error
    POST: accepted resolution records owner, timestamp, and revision evidence
    EFFECTS: pure
    FAILURE_MODES: unauthorized actor, missing decision, missing evidence
    DATA_TRANSITION: open record -> resolved record
    TERMINATION: total
  COMPARE actor with owner or explicit delegate
  REQUIRE decision and applicable evidence or approval references
  ATTACH resolved_at and current feature revision
  RETURN accepted resolution or authorization error
