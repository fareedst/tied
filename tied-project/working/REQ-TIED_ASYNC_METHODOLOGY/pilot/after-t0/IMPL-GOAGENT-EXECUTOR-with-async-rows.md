# Pilot after-t0 — IMPL-GOAGENT-EXECUTOR with W1 optional rows (documentation exercise)

**Not applied to canonical sidecar in T0** — this artifact demonstrates W1 optional async contract rows against the reference pilot. W2 will require catalog rows when gating is authorized.

# [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
# Summary: Build argv; stream-parse JSON lines; return session id and exit code — with explicit async contract rows.

procedure executor_Run(ctx, argv, out, errOut):
  # [IMPL-GOAGENT-EXECUTOR] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-GOAGENT-AGENT-EXECUTOR]
  # How: Subprocess stream-json executor with documented async contracts (T0 documentation exercise).
  Contract:
    INPUT: ctx, argv, out, errOut
    OUTPUT: session_id, exit_code | error
    PRE: ctx carries cancel signal; argv is non-empty
    POST:
      - success => session_id captured when present; exit_code from process
      - error non_zero_exit => errOut contains status; error returned with exit_code
    FAILURE_MODES: PARSE_ERROR, NON_ZERO_EXIT, TIMEOUT_EXCEEDED, CANCELLED
    DATA: session_id
    DATA_TRANSITION: unset → captured after first valid JSON line with session_id field
    EFFECTS: Async, IO
    TERMINATION: total on process exit
    ASYNC_BOUNDARY: await
    SEQUENCING: spawn before parse_lines before wait_process; stderr goroutine joins on wait
    CONTROL: ordering spawn before wait
    MESSAGE_CONTRACT: at-least-once NDJSON lines on stdout; parse errors log to errOut and continue
    CANCELLATION: caller via ctx → CANCELLED; POST: discard partial out buffer
    TIMEOUT: 30s → TIMEOUT_EXCEEDED
    RETRY: N/A — single subprocess invocation
    IDEMPOTENCY: N/A — no retry
  1. spawn process
  2. FOR each stdout line: parse JSON; on PARSE_ERROR log and continue; capture session_id on first valid line
  3. AWAIT wait_process
  4. join stderr goroutine
  5. RETURN session_id and exit_code

## Semantic class coverage

| Class | Row(s) | Notes |
|-------|--------|-------|
| Await sequencing | SEQUENCING, CONTROL: ordering | Local order only — no race-freedom claim |
| Message/event delivery | MESSAGE_CONTRACT | at-least-once lines; dedupe by line handling |
| Cancellation | CANCELLATION | ctx cancel → discard partial |
| Timeout | TIMEOUT → TIMEOUT_EXCEEDED | Example deadline; not runtime proof |
| Retry/idempotency | N/A in RETRY/IDEMPOTENCY | Single run |
| Shared DATA | DATA, DATA_TRANSITION | session_id capture |
| Termination/open wait | TERMINATION: total | Bounded by process exit |

**Proof boundary:** Structural documentation only. Does not prove provider honors deadline or physical cancel of external process.
