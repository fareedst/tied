# [IMPL-FEAT_AGENTSTREAM_ADAPTER] [ARCH-FEAT_AGENTSTREAM_ADAPTER] [REQ-FEAT_AGENTSTREAM_ADAPTER]
# How: adapt a canonical schedule to agentstream while preserving ordered feature-spec batch compatibility.

## BUILD_TASK_TURNS
# How: map ready task groups to governed turns without changing existing feature-spec turns.
Contract:
  INPUT: readiness projection; task entries; execution options
  PRE: readiness projection is deterministic and groups are safe
  OUTPUT: turns | adapter_error
  POST: each turn maps to one scheduled task group and carries stable task identity/evidence context
  FAILURE_MODES: UNSAFE_GROUP; INVALID_TASK; LEGACY_MODE_CONFLICT
  EFFECTS: pure
  TERMINATION: total
1. IF legacy feature-spec mode is selected DELEGATE to existing feature-spec loader
2. ELSE validate ready groups
3. Map each group to an agentstream Turn in scheduler order
4. Attach governed sequence controls and task identity
5. RETURN turns

## EXECUTE_SCHEDULE
# How: make dry-run and live execution consume the same turns and record outcomes through the execution-state boundary.
Contract:
  INPUT: turns; execution mode; executor; execution-state store
  PRE: turns are produced by BUILD_TASK_TURNS
  OUTPUT: dry_run_schedule | execution_report
  POST: dry-run emits the exact schedule live mode would submit; legacy feature-spec mode remains ordered
  FAILURE_MODES: EXECUTOR_FAILURE; CANCELLATION; TIMEOUT; STALE_INPUT
  EFFECTS: IO, Async, State
  DATA_TRANSITION: task pending→running→terminal outcome; evidence append
  TERMINATION: total
1. FOR each turn in stable schedule order
2. IF dry-run RETURN rendered argv/turn projection without subprocess
3. ELSE DELEGATE to existing executor
4. Record outcome and evidence
5. Stop dependents after failure, cancellation, timeout, or stale input
6. RETURN execution report