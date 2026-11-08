# [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] — Cursor live session oracle and bounded turn retry.

Grammar-Version: v2

## EXTRACT_CURSOR_SESSION_FROM_LINE

- [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] Parse one NDJSON line for resume session_id (SC-CURSOR-SESSION-01).
- Contract:
  - INPUT: json_line (trimmed string)
  - PRE: json_line non-empty
  - OUTPUT: session_id string or empty
  - POST: non-empty when line is system/init or type session oracle shape
  - EFFECTS: JSON parse only; no IO
  - FAILURE_MODES: invalid JSON → empty session_id

## STDERR_INDICATES_WRITABLE_ITERABLE_CLOSED

- [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] Detect retriable Cursor stderr signature.
- Contract:
  - INPUT: stderr_acc string
  - PRE: stderr_acc may be empty
  - OUTPUT: boolean
  - POST: true when stderr contains RetriableError and WritableIterable is closed
  - EFFECTS: pure scan

## RUN_CURSOR_TURN_WITH_RETRY

- [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] Bounded live turn attempts (SC-CURSOR-SESSION-02).
- Contract:
  - INPUT: argv, extra_env
  - PRE: CURSOR_TURN_RETRY_MAX = 2 (module constant)
  - OUTPUT: RunResult + exitCode + attempt_count
  - POST: at most CURSOR_TURN_RETRY_MAX + 1 attempts
  - EFFECTS: invokes runAgent spawn loop
  - TERMINATION: stop on session_id + exit 0, or attempts exhausted
  - CONTROL: retry when session empty AND (exit non-zero OR writable_iterable_seen)

## LIVE_EXECUTOR_FINISH_TURN

- [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] Fail-closed with DIAGNOSTIC (SC-CURSOR-SESSION-03).
- Contract:
  - INPUT: turn_outcome
  - PRE: batch requires session_id for --resume
  - OUTPUT: continue | exit 1
  - POST: DIAGNOSTIC cursor_live_session_oracle on failure with exit_code, session_captured, retriable_stderr_seen, attempt_count
  - EFFECTS: append stderr diagnostics
  - FAILURE_MODES: missing session_id after retries → exit 1; never continue without session_id

## APPEND_HARNESS_TURN_TRACE_FIELDS

- [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] Optional trace enrichment for facilitator matrices.
- Contract:
  - INPUT: trace_record, writable_iterable_seen, session_captured
  - PRE: harness trace enabled
  - OUTPUT: updated trace_record
  - POST: optional oracle fields present when trace append succeeds
  - EFFECTS: append harness-turn-trace JSONL when path resolved
