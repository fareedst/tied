# Wave 0 — promotion_status hygiene

**Date:** 2026-11-07 · **build-plan:** REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH

Reconciled stale `promotion_pending` / `proposal_created` rows whose LEAP proposals are **applied** in `leap-proposals/queue.json`.

| Feedback | Prior | After | Evidence |
| --- | --- | --- | --- |
| `fb-mvmmb3lp-723euw` | `promotion_pending` | `canonical_ready` | `lp-2026-10-24T16-33-13-575Z-707c63d33f60` applied |
| `fb-mvmmq5pl-dxzvb6` | `promotion_pending` | `canonical_ready` | workspace slice applied per queue summary |
| `fb-mvo18hye-i6x5fq` | `proposal_created` | `canonical_ready` | `lp-2026-10-25T16-23-32-863Z-c284570f3c0b` applied |
| `fb-mw6d3pz5-9cg0e8` | *(unset)* | `promotion_pending` → bridge | this REQ build-plan |
