# Close-out handoff — REQ-TIED_SPONSOR_TWO_LANE_DELIVERY

## Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true; envelope validate `fail_on_error_gaps=true` blocking_gaps=0; envelope path=`tied-project/working/REQ-TIED_SPONSOR_TWO_LANE_DELIVERY/evidence/request-evidence-envelope.v1.json` (regenerable; see [closeout-run-close-out-gates.json](./closeout-run-close-out-gates.json))
- **Process contract:** partial — `--skip-manifest` at minimal depth; tracker dual-write for build slugs via sync; [not-applicable-receipt.v1.json](./not-applicable-receipt.v1.json) backfilled via `request_evidence_envelope_backfill`
- **Adherence ledger:** pass — reconcile process_grade=band B; thin_ledger=warn (hash_alignment advisory on older gate receipts)
- **Workspace cleanliness (scoped REQ):** pass — scoped staging in traceable-commit; unrelated GF-05 / fixture drift excluded

## Unblock (2026-10-25)

Initial close-out failed `not_applicable_receipt_missing`. Cleared via `request_evidence_envelope_backfill` + re-run `run-close-out-gates.mjs` (`--envelope-blocking --sync-dispositions --reconcile --skip-manifest`).

## Gitignore hygiene

[git-hygiene-receipt-2026-10-25.md](./git-hygiene-receipt-2026-10-25.md)

## Upstream feedback capture

**N/A** — no store ingest for this REQ in this pass (local implementation close-out only).

## Commit

See parent handoff for commit SHA after traceable-commit.

## Remaining risks

- Checklist step markers (SC-TLD-003) are advisory at minimal depth; sponsor selection lane requires deployed `selection_evidence` at verification time in production workflows
- Mid-lane deferral remains warn-only per sponsor choice (W3+)
