# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: preserve stable task identity and append-only evidence across execution outcomes and resume.
Contract:
  INPUT: task_id: string where length(task_id) > 0; source_revision: int where source_revision >= 0; current_state; outcome; evidence
  PRE: task_id exists and outcome is a known execution result
  OUTPUT: next_execution_state | execution_error
  POST: task identity is unchanged; evidence history appends once; failed tasks do not satisfy dependencies
  FAILURE_MODES: UNKNOWN_TASK; INVALID_OUTCOME; STALE_INPUT; ILLEGAL_TRANSITION; DUPLICATE_DELIVERY_RECORDED; EVIDENCE_DUPLICATE_REJECTED; STORE_WRITE_FAILED; STORE_UNAVAILABLE; SCHEMA_VERSION_MISMATCH
  DATA: execution status and evidence history
  DATA_TRANSITION: attempt n→n+1; evidence history append
  EFFECTS: State
  TERMINATION: total

## APPLY_EXECUTION_OUTCOME
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: record explicit attempt outcomes without unlocking dependents after failure.
Contract:
  INPUT: task_id: string where length(task_id) > 0; source_revision: int where source_revision >= 0; current_state; outcome; evidence
  PRE: task_id exists and outcome is a known execution result
  OUTPUT: next_execution_state | execution_error
  POST: task identity is unchanged; evidence history appends once; failed tasks do not satisfy dependencies
  FAILURE_MODES: UNKNOWN_TASK; INVALID_OUTCOME; STALE_INPUT; ILLEGAL_TRANSITION
  DATA: execution status and evidence history
  DATA_TRANSITION: attempt n→n+1; evidence history append
  EFFECTS: State
  TERMINATION: total
1. CHECK source revision matches current graph revision
2. CALL APPEND_EVIDENCE with attempt identity and outcome payload
3. TRANSITION status according to outcome
4. CALL EVALUATE_DEPENDENCIES using store completion order — not broker message order alone
5. RETURN next state

## APPEND_EVIDENCE
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: append deduplicated evidence; reject duplicate logical attempts (S-T12) and record redelivery without forking identity (S-T01).
Contract:
  INPUT: task_id: string where length(task_id) > 0; attempt_key: string where length(attempt_key) > 0; idempotency_key: string optional; outcome; provenance
  PRE: attempt_key present or derivable for each append
  OUTPUT: evidence_row | execution_error
  POST: duplicate append with same attempt_key is rejected or collapsed; redelivery yields duplicate-attempt evidence or existing outcome reference without new task_id
  FAILURE_MODES: EVIDENCE_DUPLICATE_REJECTED; DUPLICATE_DELIVERY_RECORDED; STORE_WRITE_FAILED
  DATA: evidence history
  DATA_TRANSITION: evidence history append or dedup skip
  EFFECTS: State
  TERMINATION: total
1. IF idempotency_key or attempt_key matches prior delivery for same logical attempt:
   1.1 RECORD duplicate-attempt evidence OR RETURN existing outcome reference
   1.2 RETURN without forking task_id or terminal semantics
2. IF attempt_key already present in history per dedup policy: RETURN EVIDENCE_DUPLICATE_REJECTED
3. APPEND evidence with attempt, outcome, provenance, and stable ordering key
4. IF store write fails: RETURN STORE_WRITE_FAILED — task MUST NOT transition to success
5. RETURN evidence_row

## EVALUATE_DEPENDENCIES
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: unlock dependents only when predecessor satisfies completion predicate from authoritative store order (S-T05).
Contract:
  INPUT: task_id: string where length(task_id) > 0; predecessor_states; dependent_ids: list
  PRE: predecessor terminal status and completion sequence available from store
  OUTPUT: dependency_evaluation | execution_error
  POST: dependents remain locked until predecessor satisfies ARCH completion rules; message delivery order alone does not unlock
  FAILURE_MODES: UNKNOWN_TASK
  EFFECTS: State
  TERMINATION: total
1. FOR each dependent: CHECK predecessor terminal status and completion evidence order from store
2. IF predecessor failed or non-terminal: KEEP dependent locked
3. IF predecessor satisfies completion predicate: ALLOW dependent readiness per graph rules
4. RETURN dependency_evaluation

## RESUME_EXECUTION
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: resume only a compatible task state and preserve all previous evidence; unknown-outcome retry stays resumable (S-T04).
Contract:
  INPUT: task_id: string where length(task_id) > 0; requested_source_revision: int where requested_source_revision >= 0; execution_state; unknown_outcome_flag: bool optional
  PRE: execution state exists
  OUTPUT: resumable state | resume_error
  POST: compatible resume preserves task_id and evidence history; stale input is explicit; unknown-outcome path leaves resumable non-terminal state with explicit reason
  FAILURE_MODES: UNKNOWN_TASK; STALE_INPUT; CANCELLATION_NOT_RESUMABLE
  EFFECTS: pure
  TERMINATION: total
1. COMPARE requested source revision with recorded revision
2. IF different RETURN STALE_INPUT
3. IF cancelled without recovery permission RETURN CANCELLATION_NOT_RESUMABLE
4. IF unknown_outcome_flag: ENSURE status is non-terminal with explicit unknown reason — do not append conflicting terminal evidence on retry
5. RETURN state ready for a new attempt

## RECORD_TERMINAL_FAILURE_AFTER_MAX_RETRIES
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: bounded retries exhaust to stable terminal failed state; dependents stay locked (S-T14).
Contract:
  INPUT: task_id: string where length(task_id) > 0; retry_count: int; max_retries: int where max_retries >= 0
  PRE: max-retry policy configured within documented bounds
  OUTPUT: terminal_state | execution_error
  POST: terminal failure after max retries with deterministic reason; dependents not unlocked; evidence inspectable
  FAILURE_MODES: UNKNOWN_TASK
  DATA_TRANSITION: active → terminal_failed
  EFFECTS: State
  TERMINATION: total
1. IF retry_count < max_retries: RETURN resumable non-terminal state
2. TRANSITION to terminal failed with stable reason code
3. LOCK all dependents
4. RETURN terminal_state

## VALIDATE_RECORD_VERSION
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: reject incompatible evidence or normalization schema versions with deterministic ILLEGAL_TRANSITION or SCHEMA_VERSION_MISMATCH (S-T09).
Contract:
  INPUT: record_schema_version: int; expected_schema_version: int
  PRE: expected version configured for deployment
  OUTPUT: version_ok | execution_error
  POST: skew never silently mutates fingerprints or transition semantics
  FAILURE_MODES: SCHEMA_VERSION_MISMATCH; ILLEGAL_TRANSITION
  EFFECTS: pure
  TERMINATION: total
1. IF record_schema_version != expected_schema_version: RETURN SCHEMA_VERSION_MISMATCH
2. RETURN version_ok

## APPLY_RETRY_STORM_BACKPRESSURE
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: bound concurrent retries and lock wait under storm load; idempotency preserved (S-T11 architecture_constraint).
Contract:
  INPUT: inflight_retries: int; max_inflight: int; lock_wait_ms: int; max_lock_wait_ms: int
  PRE: max_inflight and max_lock_wait_ms configured
  OUTPUT: backpressure_decision
  POST: when over limit, callers receive retryable throttle without duplicate side effects
  EFFECTS: pure
  TERMINATION: total
1. IF inflight_retries >= max_inflight OR lock_wait_ms > max_lock_wait_ms: RETURN throttle_retryable
2. RETURN proceed

## READ_EXECUTION_STATUS_WITH_CONSISTENCY
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: surface bounded staleness or monotonic read token when API visibility lags store writes (S-T16).
Contract:
  INPUT: state: ExecutionState; read_token: int; store_write_token: int; partition_active: bool
  PRE: read_token and store_write_token monotonic when available
  OUTPUT: status_view | execution_error
  POST: partition or lag exposes stale_lag flag or read_token gap — never silent success inference
  EFFECTS: pure
  TERMINATION: total
1. IF partition_active OR read_token < store_write_token: RETURN status_view with stale_lag=true
2. RETURN status_view with stale_lag=false

## VALIDATE_OPERATOR_OVERRIDE
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: policy override requires audit evidence or hard reject — no silent unlock (S-O02 architecture_constraint).
Contract:
  INPUT: override_kind: string; policy_allows: bool; audit_channel_ready: bool
  PRE: override targets dependency unlock or stale recovery
  OUTPUT: override_result | execution_error
  POST: rejected overrides leave graph unchanged; accepted overrides append auditable evidence
  FAILURE_MODES: OVERRIDE_REJECTED
  EFFECTS: State
  TERMINATION: total
1. IF NOT policy_allows: RETURN OVERRIDE_REJECTED
2. IF policy_allows AND NOT audit_channel_ready: RETURN OVERRIDE_REJECTED
3. APPEND auditable override evidence row
4. RETURN override_result

## PREVIEW_BULK_CANCEL_BLAST_RADIUS
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: bulk cancel previews dependent lock blast radius before commit (S-O06 architecture_constraint).
Contract:
  INPUT: target_task_ids: list; dependency_graph: map
  PRE: graph edges available for targets
  OUTPUT: blast_radius_preview
  POST: preview lists locked dependents and requires explicit operator confirmation before mass cancel
  EFFECTS: pure
  TERMINATION: total
1. FOR each target: COLLECT transitive dependents still locked
2. RETURN blast_radius_preview with counts and task_ids
