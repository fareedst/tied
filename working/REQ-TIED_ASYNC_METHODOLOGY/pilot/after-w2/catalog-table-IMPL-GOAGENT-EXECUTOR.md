# W2 pilot — catalog-async-boundaries for IMPL-GOAGENT-EXECUTOR

**Source pseudo-code:** `working/REQ-TIED_ASYNC_METHODOLOGY/pilot/after-t0/IMPL-GOAGENT-EXECUTOR-with-async-rows.md`  
**Tracker disposition:** `async_in_scope: true`  
**Matched semantic classes:** `await_sequencing`, `message_event_delivery`, `cancellation`, `timeout`, `shared_data`, `termination`

## Closed catalog table (Phase B)

| Block | Boundary kind | Await/message/event | Timeout | Cancellation | Retry/idempotency | Shared DATA | Termination/order |
|-------|---------------|---------------------|---------|--------------|-------------------|-------------|-------------------|
| executor_Run | await | AWAIT wait_process; FOR each stdout line parse JSON (MESSAGE_CONTRACT at-least-once) | 30s → TIMEOUT_EXCEEDED | caller via ctx → CANCELLED; POST discard partial out buffer | N/A — single subprocess invocation | session_id DATA_TRANSITION unset→captured | TERMINATION: total on process exit; SEQUENCING spawn before parse before wait |

**Gate status:** All async-marked blocks have one closed row (W2 exit criterion 1).
