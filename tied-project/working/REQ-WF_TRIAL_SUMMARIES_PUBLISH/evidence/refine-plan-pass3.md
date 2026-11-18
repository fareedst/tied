# Refine-plan pass 3 — executable contracts

**Date:** 2026-11-18  
**prompt_type:** `@refine-plan`  
**Input:** [../PLAN.md](../PLAN.md) wave 2 (post pass 2)

## Clarifications (RESOLVE)

| Topic | Resolution |
| --- | --- |
| **Summary tables** | [AHE registry](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md) master + Latest-run matrix; [comparison-table](../../../docs/agent-harness-evaluation/cohort/comparison-table.md) is separate (discover cap issue). |
| **Header Rows vs catalog** | **D-HEADER-ROWS-ACTUAL** supersedes wave 1 prose implying header must equal catalog link count; catalog links can exceed master rows until sync runs (orphans excluded). After sync, expect **master row count ≥ catalog-linked readouts successfully scraped** (duplicates by readout href deduped). |
| **Registry rewrite policy** | **D-REGISTRY-INSERT-ONLY** — sync **appends** missing catalog hrefs; **does not delete** master rows whose readout left the catalog (historical runs stay in master table; Latest by max `clientId` per cell). |
| **Doc paths** | Canonical corpus under `docs/agent-harness-evaluation/` per `agent-harness-eval-docs-paths.mjs` (not legacy `docs/demos/` for readouts/registry). |
| **Row identity** | Master row keyed by **readout href basename**; catalog duplicate hrefs skipped. |
| **Matrix spot WF-03** | Target cell `cursor:grok47-low`, client **1795023644**, wall **11m** (661s), grades prefix **3.59 ·** per committed readout. |

**Gate:** `pre-implementation`; **`@build-plan`** next.