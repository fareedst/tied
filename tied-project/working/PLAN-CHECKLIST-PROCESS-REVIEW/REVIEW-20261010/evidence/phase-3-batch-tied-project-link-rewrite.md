# Phase 3 batch — legacy `../tied/*` → `tied-project/` (docs)

**Date:** 2026-10-10  
**Scope:** All `docs/**` markdown and YAML — project TIED roots and vocab links (sponsor option A). **No** deletes, **no** mass `../working/` rewrite (CPR-F02 follow-on).

## Replacements

| Pattern | Target |
| --- | --- |
| `../tied/` | `../tied-project/` (includes `../../tied/` in `docs/comparisons/`) |
| `tied/docs/` | `tied-bundle/docs/` (residual in YAML trackers, e.g. `tdd_development_loop.yaml`) |
| `tied/requirements/` … `tied/vocab/` … | `tied-project/requirements/` … `tied-project/vocab/` … |
| Index paths `tied/requirements.yaml`, etc. | `tied-project/requirements.yaml`, etc. |
| CLI `--root tied/implementation-decisions` | `--root tied-project/implementation-decisions` |

**Intentionally retained (fixture only):** `docs/checklist-process-review-plan.md` — drift labels `tied/docs`, `tied/` (2× `tied/docs` in prose).

## Post-batch sweep

```bash
rg -l '\.\./tied/' docs
→ (no matches)

rg -l 'tied/(requirements|vocab|citdp|implementation|architecture|semantic)' docs
→ docs/checklist-process-review-plan.md  # fixture `tied/docs` only via broader pattern; no live link targets

rg -c 'tied/docs' docs
→ docs/checklist-process-review-plan.md:2 (fixture text only)
```

## Files touched

Mechanical rewrite across **63** paths in first pass plus **10** index-path touch-ups (includes `docs/social/*` where legacy paths appeared).

## Out of batch (ledger)

- CPR-F04: `tied/docs` in **CITDP** / historical Tracker `evidence_refs` — update when those records are edited.
- Mass `../working/` → `../tied-project/working/` — sponsor-scoped (CPR-F02 note).
