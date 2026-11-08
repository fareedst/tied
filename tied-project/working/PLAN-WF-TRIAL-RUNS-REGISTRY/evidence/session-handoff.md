# Session handoff — PLAN-WF-TRIAL-RUNS-REGISTRY

| Field | Value |
| --- | --- |
| **handoff_kind** | `plan` |
| **request_token** | `PLAN-WF-TRIAL-RUNS-REGISTRY` |
| **prompt_type** | `build-plan` |
| **date** | 2026-11-08 |
| **plan_phase** | `post-build` |

## Plan execution steps

### Required

- [x] **extract-catalog-rows** — Enumerate 56 Recorded trials rows from `docs/demos/catalog-traditional-workflow-trial-prompts.md`
- [x] **scrape-readouts** — Harness, model_config, model_slug, seven grading bands from each linked readout
- [x] **compute-latest-flag** — Set `latest_for_cell` per PLAN duplicate-group table
- [x] **author-registry-md** — Write `docs/demos/traditional-workflow-trial-runs-registry.md`
- [x] **link-catalog-readme** — Backlinks in catalog + `docs/demos/README.md`

### Optional

- [x] **grade-scrape-audit** — Save `evidence/grade-scrape.tsv` for facilitator spot-check

### Recommendations

- Re-run scrape when new `@record-wf-trial` rows append the catalog table.

## Changelog (this REQ)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-08 | refine-plan | Bootstrap handoff; PLAN locked after sponsor questionnaire. |
| 2026-11-08 | build-plan | Published registry + cross-links; grade-scrape.tsv evidence. |
