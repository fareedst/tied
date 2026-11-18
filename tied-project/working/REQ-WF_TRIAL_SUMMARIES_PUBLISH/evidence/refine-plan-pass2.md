# Refine-plan pass 2 — registry sync + unlimited size batch

**Date:** 2026-11-18  
**prompt_type:** `@refine-plan`  
**Linked Cursor plan:** `wf_publish_registry_and_batch_b8ab24a3.plan.md`  
**Incident:** PROMPT-WF-03 @ **1795023644** missing from [master registry](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md) and Latest-run matrix after `@publish-wf-trial-summaries`; size batch capped at **50** snapshots.

## RESOLVE

| Term | Resolution |
| --- | --- |
| Summary tables | [traditional-workflow-trial-runs-registry.md](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md) master + Latest-run matrix; not comparison-table dedupe alone |
| Registry gap | `wf-trial-registry-author.mjs` was in original PLAN but never shipped; refresh-only path left catalog-only rows absent |
| Size batch | `discoverClients` default `limit: 50`; publish did not pass override |

**Sponsor intent (locked):** Publish must insert **catalog-linked** master rows and run **unlimited** discover for facilitator size batch.

**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal`

## Decisions added (wave 2)

| ID | Decision |
| --- | --- |
| **D-SIZE-UNLIMITED-PUBLISH** | `wf-trial-summaries-publish.mjs` always passes `--limit 0` to `project-size-batch-compare.mjs` unless sponsor uses `--skip-size-batch` |
| **D-DISCOVER-LIMIT-ZERO** | `limit <= 0` in `discoverClients` means no cap; CLI default remains **50** for ad-hoc runs |
| **D-REGISTRY-SYNC** | Before `refreshRegistryFromReadouts`, `syncMasterRowsFromCatalogLinks` appends missing rows from catalog readout hrefs (implements original **D-REGISTRY-SOURCE**) |
| **D-HEADER-ROWS-ACTUAL** | Registry header **Rows** = parsed master row count after sync, not catalog link count alone |
| **D-SYNC-DIAGNOSTICS** | Unscrapable/missing readout for catalog href → listed in `publish-summary.md`; do not fail publish unless matrix `--check` fails |

## Out of scope (wave 2)

- Catalog Recorded trials body rewrite (**D-CATALOG-BODY** unchanged)
- README reconcile (**D-README** deferred)
- Full 193-row registry golden