# PLAN — [REQ-TIED_PROJECT_SIZE_LAYERS]

**Trial context:** TIED methodology **store** (MCP snapshot, WF trial cohort science, facilitator `record-wf-trial`).

**Request token:** `REQ-TIED_PROJECT_SIZE_LAYERS`  
**Workflow:** `@add-feature` (Cursor plan) → **`@refine-plan`** (this pass) → `@build-plan` → `@close-out`

**`plan_phase`:** `closed` (build-plan + close-out 2026-11-09)

**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Linked Cursor plan:** `tied_size_layers_metrics_2065fc7d`

**CITDP (working draft):** [CITDP-REQ-TIED_PROJECT_SIZE_LAYERS.draft.yaml](./CITDP-REQ-TIED_PROJECT_SIZE_LAYERS.draft.yaml)

**Test strategy:** [test-strategy.md](./test-strategy.md)

**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — locked

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **atoms** | Registry agreement footprint: vocab preferred terms + `REQ`/`ARCH`/`IMPL` index atoms + optional corpus graph counts | **Locked** — layer label; not LOC |
| **operational intent** | `essence_pseudocode` applied mass (gross − template scaffolding) + analyzer **logic nodes** / procedures | **Locked** — co-updates with pseudo-code hash |
| **proof facets** | Unit, composition, E2E test counts + binding inventory rows + consistency/verify receipts | **Locked** — distributed facets, not definition |
| Human-maintained metrics policy | **YAML** registry (`lint_yaml`) | **Locked** (sponsor 2026-11-09) |
| Machine cohort stream | **JSONL** append-only; do not hand-edit for policy | **Locked** |
| MCP delivery | **`tied_project_size_snapshot`** primary | **Locked** (sponsor choice) |
| Leaderboard | Forbidden | **Locked** — catalog disclaimer + proof_boundary |

**Ambiguity accepted:** v1 vocab term count = preferred-term table rows in client glossaries (no cross-repo dedupe).

---

## 2. Problem

WF trials capture grades and orchestrator time ([traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md)) but not **three-layer size** or cross-layer ratios for repetition across harness × model × effort × methodology semver.

---

## 3. Locked placement (refine 2026-11-09)

| ID | Decision | Path / rule |
| --- | --- | --- |
| **D-C1** | Normative statistic registry (human) | [`tied-project/config/project-size-metrics.registry.yaml`](../../../tied-project/config/project-size-metrics.registry.yaml) |
| **D-C2** | Cohort append stream (machine) | [`tied-bundle/reports/wf-trial-cohort/runs.jsonl`](../../../tied-bundle/reports/wf-trial-cohort/runs.jsonl) — regenerable; append via tooling only |
| **D-C3** | Template mass v1 | Line overlap with `templates/impl-essence-pseudocode-template.md` when file exists |
| **D-C4** | Historical backfill | **Forward-only**; optional follow-on DOC (not in v1 AC) |
| **D-RECEIPT** | Per-client MCP receipt | `tied-project/working/{REQ}/evidence/project-size-snapshot.v1.json` on disposable clients when facilitator captures |
| **D-CATALOG** | Human catalog | [`docs/demos/catalog-tied-size-and-trial-statistics.md`](../../../docs/demos/catalog-tied-size-and-trial-statistics.md) |

Aligns with [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md): YAML registry = committed project config; JSONL = machine stream (not normative policy).

---

## 4. Scope

| In | Out |
| --- | --- |
| Vocab RECORD in [`tied-methodology.md`](../../../tied-project/vocab/tied-methodology.md) | Maturity score / leaderboard |
| Metric catalog MD + registry YAML | ~102-row WF backfill (D-C4) |
| `mcp-server/src/project-size/` + MCP tool | LLM graph enrichment |
| `record-wf-trial` appendix + JSONL append helper | GF trial parity v1 |
| Optional registry table columns (doc-only hint) | WF grading weight changes |

**Depends on:** [REQ-TIED_CORPUS_COMPREHENSION](../../../requirements/REQ-TIED_CORPUS_COMPREHENSION.yaml), [REQ-PSEUDOCODE_STATIC_ANALYSIS](../../../requirements/REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml), WF trial manifests, [REQ-WF_TRIAL_MODEL_EFFORT](../../../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) (factors).

---

## 5. Architecture slices

| Slice | Token | Deliverable |
| --- | --- | --- |
| 0 | — | Catalog MD, registry YAML, vocab |
| 1 | `IMPL-TIED_PROJECT_SIZE_SNAPSHOT` | MCP `tied_project_size_snapshot` |
| 2 | `IMPL-TIED_PROJECT_SIZE_RECORD_WF_TRIAL` | `record-wf-trial` reference + SKILL step |
| 3 | `IMPL-TIED_PROJECT_SIZE_COHORT_JSONL` | Append `runs.jsonl` from facilitator path |

Umbrella: **`REQ-TIED_PROJECT_SIZE_LAYERS`** · **`ARCH-TIED_PROJECT_SIZE_SNAPSHOT`**

---

## 6. MCP contract (normative for build-plan)

- **Tool:** `tied_project_size_snapshot`
- **INPUT:** `repo_root` (subject); optional `include_trial_factors` (read orchestrator + interaction inventory JSON)
- **OUTPUT:** `project-size-snapshot-receipt.v1` with `layers.atoms`, `layers.operational_intent`, `layers.proof_facets`, `cross_layer`, `hashes`, static `proof_boundary`
- **Co-update:** `operational_intent_hash` derived from merged pseudo-code bodies; recompute on every snapshot (no stale cache across hash mismatch)

Compose: corpus graph map totals, pseudocode analyze aggregates, test tier classifier (`implementation_stack_id` when present).

---

## 7. Plan execution steps (@build-plan)

1. IMPL pseudo-code sidecars for three IMPL slices; RED tests per [test-strategy.md](./test-strategy.md).
2. Publish registry YAML + catalog MD; RECORD vocab; `lint_yaml` on new YAML.
3. Implement `project-size` module; register MCP handler.
4. Extend `record-wf-trial` reference + contract test hook.
5. Dogfood read-only snapshot on one cited disposable client (path in evidence).
6. `tied_validate_consistency` → `@close-out`.

---

## 8. Handoff

- **Do next:** **`@build-plan`** on this PLAN ([plan-build-sequence-guard](../../../tools/bundled-prompt-type-skills/prompt-shared/plan-build-sequence-guard.md)).
- **Session handoff:** [evidence/session-handoff.md](./evidence/session-handoff.md)
