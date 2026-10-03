# Pilot before snapshot — IMPL-GOAGENT-EXECUTOR

**Source:** `tied/implementation-decisions/IMPL-GOAGENT-EXECUTOR-pseudocode.md` (T0 baseline)  
**Primary pilot:** subprocess stream-json executor  
**REQ chain:** REQ-GOAGENT-AGENT-EXECUTOR → ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON → IMPL-GOAGENT-EXECUTOR

## Current pseudo-code (extract)

```markdown
procedure executor_Run(ctx, argv, out, errOut):
  # How: CommandContext; async stderr copy; stdout line JSON parse; thinking delta and assistant text parts to out; capture session_id.
  spawn process
  # How: On parse error log to errOut and continue; on non-zero exit log status and return error with exit code.
  wait process
```

## Phase B catalog (manual, pre-W2)

| Block | Boundary | Timeout | Cancellation | Retry | Shared DATA | Termination |
|-------|----------|---------|--------------|-------|-------------|-------------|
| executor_Run | implicit await (spawn/wait) | not declared | ctx cancel implicit | N/A | session_id implicit | process exit |

## Semantic class gaps (documentation exercise target)

| Class | Today | T0 after-t0 target |
|-------|-------|-------------------|
| Await sequencing | spawn→parse→wait implicit | SEQUENCING / CONTROL rows |
| Message/event delivery | NDJSON lines | MESSAGE_CONTRACT example |
| Cancellation | ctx via comment | CANCELLATION row |
| Timeout | absent | TIMEOUT example or N/A |
| Retry/idempotency | N/A | documented N/A |
| Shared DATA | session_id implicit | DATA_TRANSITION example |
| Termination/open wait | open read until exit | TERMINATION: total |
