# [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] — Abort classify + session capacity highlight

Grammar-Version: v2

## WF_TRIAL_ABORT_CLASSIFY

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] How: wave 1 classify before handoff gate (SC-WF-ABS-01..04).
- Contract:
  - INPUT: `workspace: string`
  - PRE: process logs under wf-trial-orchestrator-run evidence
  - OUTPUT: env WF_TRIAL_INCOMPLETE_REASON, optional WF_TRIAL_INCOMPLETE_TURN
  - POST: session limit preferred over turn_missing_session_id; manifest merge when unset
  - EFFECTS: IO read logs; export env
procedure WF_TRIAL_ABORT_CLASSIFY:
  Contract:
    INPUT: workspace
    OUTPUT: reason enum optional
    PRE: log paths exist or empty
    POST: reason set per detection rules
    EFFECTS: IO
  CLASSIFY from stdout/stderr logs
  SET manifest fields when manifest present

## EXTRACT_SESSION_LIMIT_LINE

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: first provider reset line for highlight body (SC-WF-ABS-06).
- Contract:
  - INPUT: `source: string` file path or inline text
  - OUTPUT: `line: string`
  - PRE: source non-empty
  - POST: first line matching `(?i)session limit` trimmed or empty string
  - FAILURE_MODES: unreadable file → empty line
  - EFFECTS: pure or IO
procedure EXTRACT_SESSION_LIMIT_LINE:
  Contract:
    INPUT: source
    OUTPUT: line
    PRE: source is string
    POST: line is first session-limit match or empty
    FAILURE_MODES: empty on read error
    EFFECTS: IO when source is path
  SCAN for session limit pattern
  RETURN trimmed line

## EMIT_SESSION_LIMIT_HIGHLIGHT

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: salient stderr ERROR block (SC-WF-ABS-06..08).
- Contract:
  - INPUT: `human_line: string`
  - OUTPUT: bytes on fd 2
  - PRE: operator stderr channel
  - POST: headline ERROR, optional quoted human_line, retry hint, trailing blank line
  - FAILURE_MODES: N/A (best-effort fwrite)
  - EFFECTS: IO
procedure EMIT_SESSION_LIMIT_HIGHLIGHT:
  Contract:
    INPUT: human_line
    OUTPUT: stderr lines
    PRE: always
    POST: ERROR headline present; fd2 written
    FAILURE_MODES: N/A
    EFFECTS: IO
  WRITE ERROR headline to stderr
  IF human_line non-empty THEN WRITE indented human_line ENDIF
  WRITE retry hint
  WRITE blank line

## WF_TRIAL_PREFLIGHT_SESSION_LIMIT

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] How: L1 fail-closed before four-phase (SC-WF-ABS-07).
- Contract:
  - INPUT: `client_root: string`, `validation_exit: number`
  - OUTPUT: `should_block: boolean`
  - PRE: harness claude; not dry-run
  - POST: when validation report smoke detail matches session limit → block true and highlight; other failures advisory unless STRICT
  - EFFECTS: IO read JSON at tied-project/working/tied-claude-client-validation.v1.json
procedure WF_TRIAL_PREFLIGHT_SESSION_LIMIT:
  Contract:
    INPUT: client_root, validation_exit
    OUTPUT: should_block boolean
    PRE: client_root absolute
    POST: block when session limit in smoke detail without STRICT flag
    FAILURE_MODES: missing report → fall through advisory path
    EFFECTS: IO
  READ validation JSON
  IF smoke detail matches session limit THEN
    CALL EMIT_SESSION_LIMIT_HIGHLIGHT(EXTRACT from detail)
    RETURN block true
  APPLY existing STRICT and advisory rules for other failures

## WF_TRIAL_ABORT_HIGHLIGHT_POST_CLASSIFY

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] How: L3 highlight before incomplete_reason diagnostic (SC-WF-ABS-06).
- Contract:
  - INPUT: `workspace: string`, classified reason
  - PRE: WF_TRIAL_INCOMPLETE_REASON=claude_session_limit
  - POST: highlight emitted once before wf_trial_abort_signal_emit_diagnostic
  - FAILURE_MODES: N/A
  - EFFECTS: IO
procedure WF_TRIAL_ABORT_HIGHLIGHT_POST_CLASSIFY:
  Contract:
    INPUT: workspace, reason
    OUTPUT: stderr highlight optional
    PRE: reason is claude_session_limit
    POST: ERROR highlight before DIAGNOSTIC incomplete_reason
    FAILURE_MODES: N/A
    EFFECTS: IO
  EXTRACT line from process.stdout.log
  CALL EMIT_SESSION_LIMIT_HIGHLIGHT
  EMIT machine incomplete_reason DIAGNOSTIC

## LIVE_SESSION_LIMIT_HIGHLIGHT

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-GOAGENT-AGENT-EXECUTOR] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] How: L2 after Claude runTurn (SC-WF-ABS-08).
- Contract:
  - INPUT: turn stdout aggregate string
  - PRE: harness claude; once per executeLiveRun
  - POST: at most one highlight per run
  - FAILURE_MODES: N/A
  - EFFECTS: IO stderr
procedure LIVE_SESSION_LIMIT_HIGHLIGHT:
  # [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] How: live stderr highlight once per run
  Contract:
    INPUT: turn_stdout
    OUTPUT: highlight emitted flag
    PRE: claude harness
    POST: single EMIT when pattern matches and not yet emitted
    FAILURE_MODES: N/A
    EFFECTS: IO
  IF turn_stdout matches session limit AND NOT emitted THEN
    CALL EMIT_SESSION_LIMIT_HIGHLIGHT
    SET emitted
