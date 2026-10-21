# Close-out handoff — REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK

## Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true; envelope validate `fail_on_error_gaps=true` blocking_gaps=0; envelope path=tied-project/working/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK/evidence/request-evidence-envelope.v1.json (regenerable; see [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json))
- **Process contract:** pass — dual-write clear; manifest present ([verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json)); PSA Layer C n/a; profile minimal
- **Adherence ledger:** pass — reconcile process_grade=band B; thin_ledger=warn (advisory)

## Gitignore hygiene

N/A — see [git-hygiene-receipt-2026-10-21.md](./git-hygiene-receipt-2026-10-21.md).

## Commit

**Commit SHA:** `8f3910ae` (33 files, HTOL runbook-scoped wave)

## Remaining risks

- No real tagged cohort yet; dogfood row `mle-htol-pilot-20261021-001` stays **inconclusive**
- Runbook does not prove HTOL improves outcomes until sponsor confirms baseline + countermeasure
