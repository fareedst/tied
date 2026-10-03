# [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES]

## Summary contract
<!-- [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Project clarification records into deterministic phase blockers. -->
INPUT: feature revision, clarification records, requested phase and artifact scope
OUTPUT: readiness result with blockers and evidence
DATA: phase/blocking classification and resolution revision
PRE: records are normalized
POST: only intersecting open or stale blocking records block
EFFECTS: none
FAILURE_MODES: invalid phase, malformed record
DATA_TRANSITION: records -> readiness projection
TERMINATION: return stable readiness result

## EVALUATE_CLARIFICATION_GATE
<!-- [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Classify informational and phase-blocking uncertainty without mutation. -->
INPUT: feature revision, requested phase, affected artifacts
OUTPUT: sorted blockers
PRE: phase and artifact scope are known
POST: informational records do not block; open/stale intersecting records do
EFFECTS: none
FAILURE_MODES: unsupported phase or scope
DATA_TRANSITION: candidate records -> filtered blockers
TERMINATION: return blockers
1. For each record, mark a resolved record stale when its resolution_revision is older than a relevant feature revision.
2. Ignore informational records for blocking.
3. Select open or stale records whose classification and affected scope intersect the request.
4. Sort by phase, record id, and blocking class.

## RESOLUTION_OWNERSHIP_CHECK
<!-- [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Require authorized ownership and durable evidence for resolution. -->
INPUT: record, actor, decision evidence
OUTPUT: accepted resolution or authorization error
PRE: actor identity is available
POST: accepted resolution records owner, timestamp, and revision evidence
EFFECTS: none
FAILURE_MODES: unauthorized actor, missing decision, missing evidence
DATA_TRANSITION: open record -> resolved record
TERMINATION: return accepted or error
1. Compare actor with owner or explicit delegate.
2. Require decision and applicable evidence/approval references.
3. Attach resolved_at and current feature revision.
