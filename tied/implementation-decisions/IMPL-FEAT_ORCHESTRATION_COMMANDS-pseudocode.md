# [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS]

## Summary contract
# [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: adapt lifecycle command requests to the Batch 0 evaluator and return resumable state.
Contract:
  INPUT: command; feature_identifier; expected_revision?; command_input
  PRE: command is one of specify, refine, plan, tasks, verify, close_out
  OUTPUT: orchestration_result
  POST: read-only reports do not mutate; accepted mutations return updated state and next permitted phase
  FAILURE_MODES: UNKNOWN_COMMAND; FEATURE_NOT_FOUND; STALE_REVISION; ILLEGAL_TRANSITION; PRECONDITION_UNMET
  DATA: feature manifest; lifecycle evidence
  DATA_TRANSITION: accepted transition updates the feature manifest revision and lifecycle state; blocked transition leaves state unchanged
  EFFECTS: IO, State
  TERMINATION: total

## EXECUTE_LIFECYCLE_COMMAND
# [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: map the command to a Batch 0 transition and delegate persistence.
procedure EXECUTE_LIFECYCLE_COMMAND(command, feature_identifier, expected_revision, command_input):
  # [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: map the command to a Batch 0 transition and delegate persistence.
  Resolve the command to a requested lifecycle phase.
  IF command is unknown: RETURN UNKNOWN_COMMAND.
  Read the feature manifest.
  IF manifest is absent: RETURN FEATURE_NOT_FOUND.
  Evaluate the requested transition with the Batch 0 lifecycle engine.
  IF evaluation is blocked or illegal: RETURN current state, diagnostics, and next permitted phase.
  Apply the accepted transition through revision-safe atomic mutation.
  Return current state, new revision, diagnostics, and next permitted phase.

## REPORT_NEXT_PERMITTED_PHASE
# [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: expose the next actionable lifecycle phase without inventing later-batch gates.
procedure REPORT_NEXT_PERMITTED_PHASE(manifest, evidence):
  # [IMPL-FEAT_ORCHESTRATION_COMMANDS] [ARCH-FEAT_ORCHESTRATION_COMMANDS] [REQ-FEAT_ORCHESTRATION_COMMANDS] — How: expose the next actionable lifecycle phase without inventing later-batch gates.
  Evaluate each legal successor in matrix order.
  Select the first permitted successor.
  IF no successor is permitted: RETURN terminal_or_blocked.
  RETURN selected successor and its blocking diagnostics when applicable.
