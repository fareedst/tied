# sub-close-out-evidence-sync — REQ-TIED_HARNESS_PLATFORM_SEAM

**Date:** 2026-10-20

| Step | Result |
| --- | --- |
| Backfill NA receipt | `request_evidence_envelope_backfill` → [not-applicable-receipt.v1.json](./not-applicable-receipt.v1.json) |
| Unified close-out | [closeout-run-close-out-gates.json](./closeout-run-close-out-gates.json) — `merged_decision.allowed=true`, envelope `blocking_gap_count=0` |
| Envelope | [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json) |
| Reconcile | process_grade band **A** (`--skip-manifest`) |
