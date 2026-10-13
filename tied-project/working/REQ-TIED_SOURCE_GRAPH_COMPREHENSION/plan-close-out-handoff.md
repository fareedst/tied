# Plan-close-out handoff — full-tree (2026-10-13)

**Primary REQ:** `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]`  
**Secondary:** `[REQ-TIED_BROWNFIELD_INTENT_ELEVATION]` dogfood evidence  
**Depth:** minimal · **gate_policy:** advisory

## Completion signals

- **Machine close-out:** **pass** — SGC `close_out` `allowed=true`; envelope `fail_on_error_gaps=true` `blocking_gap_count=0`; path=`evidence/request-evidence-envelope.v1.json`; summary=`evidence/closeout-run-close-out-gates.json`
- **Process contract:** **pass** — verification replay `run_id=sgc-verification-2026-10-13-index-path`; manifest present; PSA Layer C n/a
- **Adherence ledger:** **partial** — reconcile band **B** / `thin_ledger` (minimal depth; unchanged from slice 1)

BFIE close_out replay: **pass** (dogfood evidence envelope sync; prior traceable-commit `a2be105e` unchanged).

## Gitignore close-out

**N/A** — [`evidence/git-hygiene-receipt-2026-10-13.md`](evidence/git-hygiene-receipt-2026-10-13.md)

## traceable-commit (sponsor)

1. Review [`evidence/proposed-commit-message.txt`](evidence/proposed-commit-message.txt)
2. Stage per [`evidence/git-hygiene-receipt-2026-10-13.md`](evidence/git-hygiene-receipt-2026-10-13.md) — **exclude** gitignored regenerable envelopes
3. Touchpoint 3 vocab VALIDATE on staged names
4. Commit; update handoff **traceable-commit** hash and [`traceable-commit-vocab-validation.md`](evidence/traceable-commit-vocab-validation.md)

**Optional split:** (1) SGC index path + fixture, (2) BFIE dogfood + hygiene pins only.

## Remaining risks

- Phase 2 tranche 2 (search/skeleton/blast) still deferred per CITDP.
