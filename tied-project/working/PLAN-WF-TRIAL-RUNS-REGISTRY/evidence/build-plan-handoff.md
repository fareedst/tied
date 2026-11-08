# Build-plan handoff — PLAN-WF-TRIAL-RUNS-REGISTRY

## Deliverables

| Artifact | Path |
| --- | --- |
| Runs registry | [docs/demos/traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md) |
| Catalog backlink | [Recorded trials](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) |
| Demos index | [docs/demos/README.md](../../../docs/demos/README.md) |
| Grade audit TSV | [grade-scrape.tsv](./grade-scrape.tsv) |

## Verification

- Master table row count: **56** (matches catalog `| PROMPT-WF` data rows).
- Cohort rows: **2** (`cohort-wf01`, `cohort-wf02`) with grades `—` and Latest `n/a`.
- No duplicate `Latest=yes` within any `(prompt, harness, model_config)` group.

## Do next

Sponsor commit when ready. Optional **`@close-out`** if bundling with other demo doc hygiene.
