# Close-out — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK

**Commit:** `76037cde`

Summary column **wall_clock** (integer minutes). Receipts unchanged.

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | Gates allowed; envelope OK (`close_out` 2026-11-11) |
| Process contract | Product @ `76037cde`; CITDP gate fix in follow-up commit |
| Adherence ledger | thin_ledger (advisory) |

## Verification

- 12/12 render tests
- Cohort regen: wf-06-cursor-composer25high **17** minutes
- `tied_validate_consistency` ok

## Artifacts

- `evidence/traceable-commit-evidence.md`
- `evidence/git-hygiene-receipt-2026-11-10.md`
