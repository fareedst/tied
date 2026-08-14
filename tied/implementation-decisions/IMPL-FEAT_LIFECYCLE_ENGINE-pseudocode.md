# [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE]

## Summary contract
# [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: evaluate legal lifecycle transitions without mutating persisted state.
Contract:
  INPUT: current_phase; requested_phase; validation_evidence; approval_context
  PRE: phases are known lifecycle values
  OUTPUT: allow | blocked | approval_required | transition_error
  POST: illegal transitions preserve state; allow requires all preconditions
  FAILURE_MODES: UNKNOWN_PHASE; ILLEGAL_TRANSITION; PRECONDITION_UNMET; APPROVAL_REQUIRED
  EFFECTS: pure
  TERMINATION: total

## LIFECYCLE_TRANSITION_MATRIX
# [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: encode draft → refining → specified → planned → tasked → verifying → closed and terminal abandoned.
procedure EVALUATE_TRANSITION(current_phase, requested_phase, validation_evidence, approval_context):
  Contract:
    INPUT: current_phase; requested_phase; validation_evidence; approval_context
    PRE: phases are known
    OUTPUT: transition_result
    POST: legal transitions return permitted, blocked, or approval outcome
    FAILURE_MODES: UNKNOWN_PHASE; ILLEGAL_TRANSITION; PRECONDITION_UNMET; APPROVAL_REQUIRED
    EFFECTS: pure
    TERMINATION: total
  LOOK UP requested transition in LIFECYCLE_TRANSITION_MATRIX
  IF transition is absent: RETURN ILLEGAL_TRANSITION
  IF preconditions are unmet: RETURN blocked
  IF approval is absent: RETURN approval_required
  RETURN allow requested_phase

## APPLY_ACCEPTED_TRANSITION
# [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: apply an allowed transition as one immutable revision.
procedure APPLY_ACCEPTED_TRANSITION(manifest, transition_result):
  # [IMPL-FEAT_LIFECYCLE_ENGINE] [ARCH-FEAT_LIFECYCLE_STATE_MACHINE] [REQ-FEAT_LIFECYCLE] — How: apply an allowed transition as one immutable revision.
  Contract:
    INPUT: manifest; transition_result
    PRE: transition_result is allow and revision is valid
    OUTPUT: next_manifest | transition_error
    POST: next_manifest has allowed phase and revision incremented once; input is unchanged
    FAILURE_MODES: TRANSITION_NOT_ALLOWED; INVALID_REVISION
    DATA: manifest phase and revision
    DATA_TRANSITION: phase current→requested; revision n→n+1
    EFFECTS: pure
    TERMINATION: total
  IF transition_result is not allow: RETURN TRANSITION_NOT_ALLOWED
  COPY manifest
  SET lifecycle phase to allowed next phase
  INCREMENT revision once
  RETURN copied manifest
