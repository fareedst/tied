# Close-out handoff — REQ-TIED_HARNESS_LANGCHAIN_PHASE3

## Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true; envelope validate blocking_gap_count=0; envelope path=`tied-project/working/REQ-TIED_HARNESS_LANGCHAIN_PHASE3/evidence/request-evidence-envelope.v1.json` (regenerable; see [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json))
- **Process contract:** partial — `--skip-manifest` at minimal depth; [not-applicable-receipt.v1.json](./not-applicable-receipt.v1.json) backfilled via `request_evidence_envelope_backfill`
- **Adherence ledger:** pass — reconcile process_grade=band B; thin_ledger=warn (advisory)

## Unblock (2026-10-21)

Prior close-out failed with envelope gap **`not_applicable_receipt_missing`**. Fixed by backfilling minimal-depth NA receipt and re-running `run-close-out-gates.mjs` with `--envelope-blocking --sync-dispositions --reconcile --skip-manifest`.

## Gitignore hygiene

See [git-hygiene-receipt-2026-10-21.md](./git-hygiene-receipt-2026-10-21.md).

## Commit

**Commit SHA:** `7c84e2c9` (47 files, Phase 3 scoped wave).

## Remaining risks

- LangSmith / trace-store automation still deferred (costly)
- Terminal Bench or LangChain % as TIED effectiveness claims — forbidden per row 15 sponsor_notes
- Stale `TIED_BASE_PATH` under `chatgpt/tied-project/` — edit only **stdd/tied-project/**
