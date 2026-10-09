# sub-close-out-evidence-sync — REQ-TIED_VOCABULARY_OWNERSHIP

**Date:** 2026-10-09

Unified close-out via `run-close-out-gates.mjs` with `--sync-dispositions --reconcile --envelope-blocking`.

- **run_id:** `vocab-a4a-close-20261009`
- **Receipt:** [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json) — `merged_decision.allowed: true`, envelope `blocking_gap_count: 0`
- **Tracker:** dual-write from `execution_evidence.completed` (21 slugs) via `sync-tracker-dispositions.mjs`
- **not-applicable-receipt:** [not-applicable-receipt.v1.json](./not-applicable-receipt.v1.json) (minimal depth adversarial)
