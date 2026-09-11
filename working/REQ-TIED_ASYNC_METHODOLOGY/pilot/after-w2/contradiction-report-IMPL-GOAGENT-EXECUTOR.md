# W2 pilot — flag-async-contradictions report for IMPL-GOAGENT-EXECUTOR

**IMPL:** IMPL-GOAGENT-EXECUTOR (documentation exercise against after-t0 pilot)  
**Phase:** Phase B rehearsal  
**async_in_scope:** true

## Contradiction scan results

| Check | Outcome | Route |
|-------|---------|-------|
| AWAIT without Promise OUTPUT / Async EFFECTS (typed evidence N/A in pilot) | Pass — EFFECTS includes Async | — |
| Async EFFECTS without boundary rationale | Pass — AWAIT and ASYNC_BOUNDARY present | — |
| SEQUENCING/CONTROL caller/callee mismatch | N/A — single IMPL in pilot | — |
| MESSAGE_CONTRACT vs handler dedup | Pass — parse errors log and continue | — |
| RETRY without IDEMPOTENCY | Pass — RETRY/IDEMPOTENCY documented N/A | — |
| Open wait without TERMINATION | Pass — TERMINATION: total | — |
| REQ timeout vs IMPL TIMEOUT | Pass — TIMEOUT row present | — |

## Integrated inquiry cases (documented only — W2)

When `depth_tier: integrated` and `async_in_scope: true`, pre_implementation documents request for:

1. Timeout without FAILURE_MODE — **Pass** (TIMEOUT_EXCEEDED in FAILURE_MODES)
2. Double AWAIT on non-idempotent DATA — **N/A** (single AWAIT)
3. Missing ordering between SEND and AWAIT — **Pass** (SEQUENCING/CONTROL rows)
4. Retry without duplicate protection — **N/A** (no RETRY)

**Note:** No `tied_adversarial_inquiry_run` invoked (W3 scope).
