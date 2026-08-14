# [IMPL-FEAT_TASK_DERIVATION] [ARCH-FEAT_TASK_DERIVATION_BOUNDARY] [REQ-FEAT_TASK_DERIVATION]
# How: derive a deterministic task graph source projection from canonical records without copying their bodies.

## DERIVE_TASK_GRAPH
# How: validate canonical projections and emit stable task entries for Batch 4 and the scheduler.
Contract:
  INPUT: REQ acceptance criteria; ARCH boundaries; IMPL blocks and contracts; clarification readiness; constitution compliance; quality profiles
  PRE: all source references resolve; blocking clarification and constitution gates pass; projections are normalized
  OUTPUT: task_graph_projection | derivation_error
  POST: every task has task_id, source_tokens, depends_on, deliverables, test_level, parallel_group, status, evidence, source_revision
  FAILURE_MODES: INVALID_SOURCE_REFERENCE; BLOCKED_READINESS; INVALID_CONTRACT; IDENTITY_COLLISION
  EFFECTS: pure
  TERMINATION: total
1. VALIDATE_SOURCE_PROJECTIONS
2. DERIVE_TASK_ENTRIES from acceptance criteria, ARCH boundaries, and IMPL blocks
3. ASSIGN_STABLE_TASK_IDENTITIES from canonical source tokens and role
4. DERIVE_DEPENDENCIES from explicit boundary and contract relations
5. DERIVE_TEST_LEVEL from testability classification and governed sequence
6. DERIVE_EVIDENCE_REQUIREMENTS from selected quality profiles
7. SORT task entries by stable task_id
8. RETURN projection and source revision metadata

## VALIDATE_SOURCE_PROJECTIONS
# How: reject unresolved references, blocked readiness, malformed contracts, and duplicate stable identities before graph publication.
Contract:
  INPUT: canonical projections; readiness results
  PRE: inputs are parseable mappings
  OUTPUT: validated projections | derivation_error
  POST: accepted projections contain no unresolved blocking gate or duplicate identity
  FAILURE_MODES: INVALID_SOURCE_REFERENCE; BLOCKED_READINESS; INVALID_CONTRACT; IDENTITY_COLLISION
  EFFECTS: pure
  TERMINATION: total
1. RESOLVE every source token through the canonical reference boundary
2. REJECT any open or stale blocking clarification
3. REJECT any failed required constitution diagnostic
4. REJECT duplicate derived task identities
5. RETURN validated projections