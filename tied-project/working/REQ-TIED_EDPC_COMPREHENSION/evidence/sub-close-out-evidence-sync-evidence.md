# sub-close-out-evidence-sync

**Date:** 2026-10-19

| Step | Result |
| --- | --- |
| Verification manifest (reuse) | [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) |
| Envelope rebuild + validate | [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json) — **blocking_gap_count=0** |
| Layer C PSA (close_out gate) | `tied-bundle/working/REQ-TIED_EDPC_COMPREHENSION/pseudocode-analysis/IMPL-TIED_EDPC_*.v1.json` (4 reports, `gate_mode_applied`) |
| Close-out runner | [closeout-run-close-out-gates.json](./closeout-run-close-out-gates.json) — `merged_decision.allowed=true` |

**Note:** `run-close-out-gates.mjs` reconcile default ledger path is under `tied-bundle/working/.../gates/ledger.jsonl`; authoritative program ledger remains [../gate-ledger.jsonl](../gate-ledger.jsonl) with pre_impl + verification + close_out receipts.
