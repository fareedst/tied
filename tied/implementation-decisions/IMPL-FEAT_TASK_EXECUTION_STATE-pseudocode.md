# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: preserve stable task identity and append-only evidence across execution outcomes and resume.
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
2. APPEND evidence with attempt, outcome, provenance, and stable ordering key
3. TRANSITION status according to outcome
4. MARK dependent tasks blocked unless outcome satisfies completion predicate
5. RETURN next state

## RESUME_EXECUTION
# [IMPL-FEAT_TASK_EXECUTION_STATE] [ARCH-FEAT_TASK_EXECUTION_STATE] [REQ-FEAT_TASK_EXECUTION_RECOVERY] — How: resume only a compatible task state and preserve all previous evidence.
Contract:
  INPUT: task_id: string where length(task_id) > 0; requested_source_revision: int where requested_source_revision >= 0; execution_state
  PRE: execution state exists
  OUTPUT: resumable state | resume_error
  POST: compatible resume preserves task_id and evidence history; stale input is explicit
  FAILURE_MODES: UNKNOWN_TASK; STALE_INPUT; CANCELLATION_NOT_RESUMABLE
  EFFECTS: pure
  TERMINATION: total
1. COMPARE requested source revision with recorded revision
2. IF different RETURN STALE_INPUT
3. IF cancelled without recovery permission RETURN CANCELLATION_NOT_RESUMABLE
4. RETURN state ready for a new attempt
