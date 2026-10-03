# [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
# Summary: Build argv with trust/force/model/workspace/resume; stream-parse JSON lines; return session id and exit code.

# How: Cross-IMPL — consumes []Turn.Parts from IMPL-GOAGENT-PIPELINE path; SessionID type from IMPL-GOAGENT-LIB-TYPES. Protocol parity with IMPL-ATDD-E2E-AGENT_STREAM ([ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]) without calling Ruby.


Grammar-Version: v2

procedure executor_Run(ctx, argv, out, errOut):
  Contract:
    INPUT: argv: list where length(argv) > 0; ctx; out; errOut streams
    PRE: argv builds a valid agent subprocess command
    OUTPUT: session_id string, exit code, optional error
    POST:
      - success => session_id captured when present; stdout JSON lines parsed to out
      - failure => non-zero exit code surfaced with error
    FAILURE_MODES: SPAWN_FAILED, JSON_PARSE_ERROR, NON_ZERO_EXIT
    TERMINATION: total — subprocess start, stream read, and wait complete
    EFFECTS: IO

  # [IMPL-GOAGENT-EXECUTOR] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-GOAGENT-AGENT-EXECUTOR]
  # How: CommandContext; async stderr copy; stdout line JSON parse; thinking delta and assistant text parts to out; capture session_id.
  # How: Start agent subprocess (os/exec).
  spawn process
  # [IMPL-GOAGENT-EXECUTOR] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-GOAGENT-AGENT-EXECUTOR]
  # How: On parse error log to errOut and continue; on non-zero exit log status and return error with exit code.
  # How: Await completion; join stderr goroutine.
  wait process