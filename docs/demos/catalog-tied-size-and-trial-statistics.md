# Catalog — TIED project size and trial statistics

**Audience:** Trial facilitators and sponsors comparing WF cohorts.

**Authority:** Human metric policy lives in [`tied-project/config/project-size-metrics.registry.yaml`](../../tied-project/config/project-size-metrics.registry.yaml). Machine cohort stream: [`tied-bundle/reports/wf-trial-cohort/runs.jsonl`](../../tied-bundle/reports/wf-trial-cohort/runs.jsonl) (append via tooling only).

**MCP:** `tied_project_size_snapshot` — evidence-only; every receipt includes `proof_boundary`. Snapshot output does **not** change REQ status or WF grading weights.

## Three size layers

| Layer | Meaning | Not |
| --- | --- | --- |
| **Atoms** | Vocab preferred terms + REQ/ARCH/IMPL index atoms (+ optional corpus graph totals) | LOC as sole definition |
| **Operational intent** | `essence_pseudocode` applied mass (`applied_lines` and `applied_utf8_bytes`) and analyzer logic nodes | Stale size when pseudo-code changes without hash update |
| **Proof facets** | Unit, composition, E2E **test cases** (`node:test` `it`/`test` per file when `validator_version` ≥ 1.1.0); binding-inventory-related cases; verify evidence **files** | Product definition or maturity score |

**Validator note:** `layers.proof_facets` tier integers counted **files** when `validator_version` &lt; 1.1.0; **test cases** from 1.1.0 onward.

**Path-declared composition ([REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS.yaml)):** `composition_tests` sums **path-declared** composition-tier cases only (including `*.integration.test.ts`, `*.binding.test.ts`, `*.contract.test.ts`). Fine **`proof_subtype`** labels (e.g. `composition.wiring`) are path-derived in the store classifier; receipt **`label_case_counts`** ships at `validator_version` **1.2.0** ([REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE.yaml)). Pre-1.2.0 receipts lack `label_case_counts` and `composition_inferred_cases`. Taxonomy: [proof-test-label-taxonomy.md](../../tied-project/working/REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md).

**Co-update rule:** `operational_intent_hash` is derived from merged IMPL `*-pseudocode.md` bodies and recomputed on every snapshot.

## Cross-layer ratios

Receipt `cross_layer` holds simple ratios (e.g. `operational_intent_per_atom`, `operational_intent_utf8_per_atom`). Ratios are descriptive for cohort science only — **no leaderboard**, **no universal maturity score**.

## Facilitator capture

1. On subject disposable client (read-only): `tied_project_size_snapshot` with `repo_root` = client root.
2. Optional: archive `tied-project/working/{REQ}/evidence/project-size-snapshot.v1.json`.
3. `@record-wf-trial` readout **Project size layers** appendix cites the receipt ([reference § Size layers](../../tools/bundled-record-wf-trial-skill/reference.md#project-size-layers)).
4. Cohort append: `runs.jsonl` via facilitator tooling ([IMPL-TIED_PROJECT_SIZE_COHORT_JSONL](../../tied-project/implementation-decisions/IMPL-TIED_PROJECT_SIZE_COHORT_JSONL.yaml)).

## Facilitator cohort summary (discover batch)

**Authoritative multi-client table:** [`comparison-table.md`](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) — **`## Summary`** rows with size layers plus **`wall_clock`** (orchestrator wall time in **whole minutes**) and optional **`grades`** (`mean · Req/Tr/Ts/Al/Pr/Ch/Ml` from trial readouts; not REQ status). Rows dedupe by display label (`wf-NN-…`); latest discover epoch wins.

Regenerate after new disposable clients land under the discover parent (default `~/Documents/dev/test`):

```bash
node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root /path/to/stdd \
  --include-trial-factors
```

Receipts: `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/*.json`. Plan: [project-size-batch-discover-compare](../../tied-project/non-tied-plans/project-size-batch-discover-compare/PLAN.md).

## Related

- [REQ-TIED_PROJECT_SIZE_LAYERS](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_LAYERS.yaml)
- [Traditional workflow trial runs registry](./traditional-workflow-trial-runs-registry.md) (grades and **Run time** in seconds — complementary, not duplicate)
