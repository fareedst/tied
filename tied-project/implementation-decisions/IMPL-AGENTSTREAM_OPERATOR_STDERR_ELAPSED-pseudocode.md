# [IMPL-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [ARCH-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED]

Grammar-Version: v2

## OPERATOR_STDERR_FORMAT

- [IMPL-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [ARCH-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] Format operator DEBUG/DIAGNOSTIC at emission with SSSS offset from shared epoch.
- Contract:
  - INPUT: level (DEBUG|DIAGNOSTIC), body text, optional atMs
  - PRE: AGENTSTREAM_OPERATOR_ELAPSED not 0; body not already prefixed with SSSS LEVEL
  - OUTPUT: single stderr line with trailing newline
  - POST: plain line is `SSSS LEVEL: body`; color when TTY and not plain
  - EFFECTS: resolve epoch from TIED_OPERATOR_EPOCH_MS or process start
  - FAILURE_MODES: opt-out yields legacy `LEVEL: body`

## ORCHESTRATOR_EPOCH

- [IMPL-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [ARCH-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] workflow-trial and four-phase scripts call operator_stderr_epoch_init before subprocess agentstream.
- Contract:
  - INPUT: shell orchestrator start
  - PRE: node available for millisecond wall clock
  - OUTPUT: exported TIED_OPERATOR_EPOCH_MS
  - POST: child agentstream inherits env