# Close-out handoff — stub-capture-policy

| Field | Value |
| --- | --- |
| **request_token** | REQ-TIED_EXTERNAL_SERVICE_COMPARISON |
| **run_id** | close-out-esc-stub-capture-2026-11-17-r2 |
| **gate** | allowed |
| **envelope** | blocking_gap_count 0 |

## Completion signals

| Signal | Status |
| --- | --- |
| Machine (tests) | 27/27 bootstrap contract tests green |
| Process (gate) | close_out allowed; receipt under `tied-bundle/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/gates/` |
| Ledger (commit) | `58f94114` |

## Gitignore note

Additional article stubs (`onono-*`, etc.) remain **gitignored** unless `!docs/comparisons/…` allowlisted; local tree satisfies `comparison-capture-stub-policy.test.mjs`.