# Close-out handoff — REQ-TIED_SPONSOR_TWO_LANE_DELIVERY

## Completion signals (after unblock pass)

- **Machine close-out:** pass — gate `close_out` allowed=true; envelope `fail_on_error_gaps=true` blocking_gaps=0; envelope path=`tied-project/working/REQ-TIED_SPONSOR_TWO_LANE_DELIVERY/evidence/request-evidence-envelope.v1.json`
- **Process contract:** pass — `verification-evidence-manifest.v1.json` collected; CITDP `evidence.command_seq`; step evidence md + `tied_verify` ok ([tied-verify-unblock.json](./tied-verify-unblock.json))
- **Adherence ledger:** pass — reconcile band **B** (hash_alignment advisory on regenerable gate JSON only)
- **Workspace cleanliness (scoped REQ):** pass

## Unblock pass (2026-10-25)

1. CITDP + persisted citdp **`evidence.command_seq`** (runnable npm/doc/vocab battery).
2. **`verification-evidence-manifest.v1.json`** via `run-close-out-gates.mjs` (no `--skip-manifest`).
3. Per-slug evidence md files + **`sync-tied-stack`** disposition.
4. **`selection-lane-operator-runbook.md`** + CITDP **`operator_selection_lane_example`** (selection_evidence worked example).
5. **`tied_verify`** with full inner CITDP + `checklist_gate` phase `close_out`.

Initial close-out **`not_applicable_receipt_missing`** cleared earlier via `request_evidence_envelope_backfill`.

## Gitignore hygiene

[git-hygiene-receipt-2026-10-25.md](./git-hygiene-receipt-2026-10-25.md)

## Upstream feedback capture

**N/A** — no store ingest for this REQ.

## Commits

- **`b286f10a`** — initial scoped feature + machine close-out
- Unblock follow-up commit pending (this pass)

## Remaining risks (accepted policy)

- **Mid-lane deferral warn-only** — intentional per PLAN; hard-block requires a **new REQ** (documented in [selection-lane-operator-runbook.md](./selection-lane-operator-runbook.md)).
- **Future features** must attach real **`selection_evidence`** per runbook before selection-lane preference (machinery is shipped; operator duty remains).
