# Close-out handoff — REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP

## Three completion signals

| Signal | Status |
| --- | --- |
| **Machine close-out** | `run-close-out-gates.mjs` `merged_decision.allowed: true`; envelope validate `blocking_gap_count: 0` |
| **Process contract** | Tracker through `traceable-commit`; CITDP `record_status: complete` |
| **Adherence ledger** | Gate receipts under `gates/`; reconcile band **B** (`thin_ledger` advisory) |

## Commit

**Commit SHA:** `616b2bdd` (38 files, HTOL-scoped wave).
