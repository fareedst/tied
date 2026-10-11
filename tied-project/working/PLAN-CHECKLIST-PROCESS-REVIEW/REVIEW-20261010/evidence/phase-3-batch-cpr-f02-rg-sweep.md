# Phase 3 batch — CPR-F02 (dual `working/` roots)

**Date:** 2026-10-10  
**Scope:** Navigation callouts only — **no** mirror deletion, **no** bulk link rewrite.

## Repository fact (store)

```bash
readlink working
# → tied-project/working

git ls-files -s working
# → 120000 … working   (symlink tracked in git)
```

Top-level name parity (`comm` of `working/` vs `tied-project/working/`): **136** entries (same tree via alias).

## Doc link survey (`docs/*.md`)

| Pattern | File count (approx.) |
| --- | ---: |
| Markdown links `../working/` | 17 |
| Explicit `tied-project/working` | 12 |

**Disposition:** Legacy `../working/` links remain valid on this repo via symlink. New authoring should prefer `tied-project/working/` per [tied-project/working/README.md](../../../README.md).

## Artifacts added/updated

| Path | Change |
| --- | --- |
| `tied-project/working/README.md` | Canonical working-root operator note |
| `README.md` | Repository layout lists `working/` symlink |
| `AGENTS.md` | Working-folder alias guidance |
| `docs/checklist-process-review-plan.md` | Drift-pattern row cites store symlink |

## Out of batch (ledger)

- Mass replace `../working/` → `../tied-project/working/` across all plans (sponsor-scoped follow-on).
- Removing root `working/` symlink (would break legacy links until rewritten).
