# [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]

Grammar-Version: v2

## Summary contract
INPUT: feedback_ids and/or observation_group with digest; optional digest_projection_hash; optional production_system_surface
PRE: feedback store readable; bridge-eligible entries are type methodology_improvement
OUTPUT: MethodologyKaizenExperimentBridgeReport with draft or diagnostics
POST: ok true yields draft without experiment_id; no methodology-experiments.yaml write
FAILURE_MODES: INELIGIBLE_FEEDBACK_TYPE, FEEDBACK_NOT_FOUND, STALE_DIGEST_HASH, MISSING_DIGEST, INVALID_OBSERVATION_GROUP
EFFECTS: read-only on all stores
TERMINATION: total

## BUILD_EXPERIMENT_DRAFT_FROM_FEEDBACK
# [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] — Map feedback rows to v1 draft fields.
Contract:
  INPUT: eligible FeedbackEntry[]
  OUTPUT: draft mapping with source_feedback_refs, hypothesis, baseline, proof_boundary
  PRE: all entries methodology_improvement
  POST: omits methodology_outcome_observation on initial bridge
  EFFECTS: none
  TERMINATION: total

## RUN_METHODOLOGY_KAIZEN_EXPERIMENT_BRIDGE
# [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [REQ-FEEDBACK_TO_TIED] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — Orchestrate eligibility, digest hash, load feedback.
Contract:
  INPUT: BridgeInput
  OUTPUT: BridgeReport
  PRE: explicit caller invocation only
  POST: stale digest_projection_hash rejected
  EFFECTS: none
  TERMINATION: total
  RESOLVE feedback ids from observation_group when digest present
  IF digest_projection_hash: validate freshness vs computeProjectionHash(digest)
  LOAD feedback entries; DELEGATE BUILD_EXPERIMENT_DRAFT_FROM_FEEDBACK

## MCP_TOOL_SURFACE
# [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] — tied_methodology_kaizen_experiment_bridge
Contract:
  INPUT: MCP args mirror BridgeInput
  OUTPUT: JSON BridgeReport
  PRE: registered in tools index
  POST: no store writes
  EFFECTS: none
  TERMINATION: total
