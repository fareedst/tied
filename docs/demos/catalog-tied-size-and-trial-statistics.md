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

**Co-update rule:** `operational_intent_hash` is derived from merged IMPL `*-pseudocode.md` bodies and recomputed on every snapshot.

## Cross-layer ratios

Receipt `cross_layer` holds simple ratios (e.g. `operational_intent_per_atom`, `operational_intent_utf8_per_atom`). Ratios are descriptive for cohort science only — **no leaderboard**, **no universal maturity score**.

## Facilitator capture

1. On subject disposable client (read-only): `tied_project_size_snapshot` with `repo_root` = client root.
2. Optional: archive `tied-project/working/{REQ}/evidence/project-size-snapshot.v1.json`.
3. `@record-wf-trial` readout **Project size layers** appendix cites the receipt ([reference § Size layers](../../tools/bundled-record-wf-trial-skill/reference.md#project-size-layers)).
4. Cohort append: `runs.jsonl` via facilitator tooling ([IMPL-TIED_PROJECT_SIZE_COHORT_JSONL](../../tied-project/implementation-decisions/IMPL-TIED_PROJECT_SIZE_COHORT_JSONL.yaml)).

## Related

- [REQ-TIED_PROJECT_SIZE_LAYERS](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_LAYERS.yaml)
- [Traditional workflow trial runs registry](./traditional-workflow-trial-runs-registry.md)
