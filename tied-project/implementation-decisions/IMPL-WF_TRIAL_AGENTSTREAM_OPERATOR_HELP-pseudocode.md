# [IMPL-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [ARCH-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] — Early operator help for workflow-trial-agentstream with stderr-first texture.

Grammar-Version: v2

## Operator help dispatch

- [IMPL-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [ARCH-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] How: Peel global help flags before orchestration; print styled help; exit 0 without bootstrap side effects.

procedure WF_TRIAL_HELP_EARLY_DISPATCH:
  # [IMPL-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [ARCH-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] How: Detect empty argv or explicit help; honor stream/plain overrides; skip REPO_ROOT and gawk gates.
  Contract:
    INPUT: script argv; env NO_COLOR, TIED_CLI_PLAIN, TIED_CLI_HELP_STDOUT
    OUTPUT: exit 0 after help when help requested; otherwise fall through to orchestrator
    PRE: SCRIPT_DIR resolved; help inc sourced
    POST: help path stdout empty unless stdout stream selected; no WF_ID required
    FAILURE_MODES: unknown_global_flag (only on help peel when extra tokens present)
    EFFECTS: IO
    TERMINATION: total on help path
  CALL WF_TRIAL_HELP_STREAM_INIT
  CALL WF_TRIAL_HELP_PLAIN_INIT
  IF argv empty OR argv is only -h/--help OR argv is only global flags then help intent
  IF help intent AND remaining args after peel THEN fail unknown excess
  IF help intent THEN
    CALL WF_TRIAL_AGENTSTREAM_PRINT_HELP
    EXIT 0
  RETURN

procedure WF_TRIAL_AGENTSTREAM_PRINT_HELP:
  # [IMPL-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [ARCH-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] How: Emit title, Usage, Examples, Batch helper, Environment, Related via texture helpers.
  Contract:
    INPUT: _WF_HELP_FD, _WF_HELP_USE_TEXTURE
    OUTPUT: sectioned operator reference on selected fd
    PRE: stream and plain init complete
    POST: content includes workflow_trial_range effort slot and MODEL_EFFORT
    EFFECTS: IO
  EMIT sections per PLAN
  RETURN
