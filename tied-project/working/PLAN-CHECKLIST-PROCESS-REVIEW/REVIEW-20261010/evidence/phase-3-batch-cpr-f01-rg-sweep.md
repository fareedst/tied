# Phase 3 batch — CPR-F01 + CPR-F03 (path rewrite)

**Date:** 2026-10-10  
**Scope:** `docs/*.md` legacy `tied/docs` → `tied-bundle/docs`; CPR-F03 base path in `docs/layerb-sidecar-fix-close-out.md`

## Replacements

| Pattern | Target |
| --- | --- |
| `../tied/docs/` | `../tied-bundle/docs/` |
| `tied/docs/` (prose and links) | `tied-bundle/docs/` |

**Intentionally retained:** `docs/checklist-process-review-plan.md` still mentions `tied/docs` as a *drift pattern label* (2 occurrences).

## Post-batch sweep

```text
rg -c 'tied/docs' docs/*.md
→ docs/checklist-process-review-plan.md:2 (fixture text only)

rg -l '../tied/docs' docs/*.md
→ (no matches)

rg -c '../tied/docs' docs/*.md
→ 0 link targets
```

## CPR-F03

- `docs/layerb-sidecar-fix-close-out.md`: `tied_config_get_base_path` example path `…/stdd/tied/` → `…/stdd/tied-project/`.

## Out of batch (ledger)

- ~~`../tied/requirements/`, `../tied/vocab/`, … in `docs/`~~ — **done** 2026-10-10 in [`phase-3-batch-tied-project-link-rewrite.md`](phase-3-batch-tied-project-link-rewrite.md).
- CPR-F02 repo-root `working/` mirrors — not started.
