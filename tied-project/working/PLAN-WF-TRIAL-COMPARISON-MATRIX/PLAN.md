# Plan — WF trial latest-run comparison matrix

| Field | Value |
| --- | --- |
| **Working token** | `PLAN-WF-TRIAL-COMPARISON-MATRIX` |
| **plan_phase** | `post-build` |
| **Refined** | 2026-11-09 (`@refine-plan`) |
| **Change class** | Facilitator **doc-only** — **no `[REQ-*]` mint** |
| **Primary deliverable** | New `## Latest-run comparison matrix` in [`docs/demos/traditional-workflow-trial-runs-registry.md`](../../../docs/demos/traditional-workflow-trial-runs-registry.md) (above Footnotes) |
| **Parent context** | Master table from [PLAN-WF-TRIAL-RUNS-REGISTRY](../PLAN-WF-TRIAL-RUNS-REGISTRY/PLAN.md) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **Tracker** | None (docs-only; no checklist copy required) |

**profile_depth:** `minimal` · **gate_policy:** `facilitator_doc_only` · **depth_tier:** `minimal`

---

## Refine (Touchpoint 1 — RESOLVE)

**Invocation:** Sponsor plan for a **pivot comparison table** on the trial runs registry (model specs × PROMPT-WF-01…08, newest run per cell).

| Sponsor term | Resolved meaning |
| --- | --- |
| **Model spec (column)** | **`toolset_key`** = `{harness}:{config_id}` with optional `@{effort}` when `model_effort` is `medium` or `high` — not raw **`model_slug`** alone |
| **Newest run** | Row with **maximum numeric `client_id`** among master-table rows matching `(WF index, toolset_key)` — **recomputed**; do not trust master **Latest** when effort and baseline share one slug |
| **Mean task duration / four prompts** | **Orchestrator wall clock (seconds)** for the full four sponsor turns (`add-feature` … `close-out`) — same as master **Run time**; not per-turn means |
| **Grade** | Leading **mean** from compact **Grades** (`0.00`–`4.00`) per [Facilitator grading readout](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout) |
| **Curated columns** | Locked manifest below: baseline cells from [`wf-trial-model-specs.yaml`](../../../docs/demos/wf-trial-model-specs.yaml) plus **model-effort** columns from batch **1794246\*** / **1794256\*** / **1794264\*** |

### Locked scope (sponsor + questionnaire)

| Decision | Choice |
| --- | --- |
| Duration | Single wall time per cell (`wall_only`) |
| Columns | Baseline toolset columns **and** effort-tier columns (sponsor selected effort cohort; original ask was cross-toolset comparison) |
| Master table | **Unchanged** except footnote bullet + new section |
| Generator | One-off script in working `evidence/`; **not** CI (consistent with registry plan) |

### Out of scope

- Fixing duplicate `Latest=yes` rows in the master table (document drift; optional follow-up)
- Per-turn duration scraping from `process.stderr.log`
- `maturity_score`, leaderboard language, REQ/ARCH/IMPL YAML

**Consequence ladder:** Doc edit = **reversible**. Wrong pivot = regenerate from master table.

---

## Column manifest (normative)

Column order left → right: **Cursor baseline**, **Claude baseline**, **effort overlay**.

| `column_id` | Header | `toolset_key` |
| --- | --- | --- |
| `cursor-composer-2.5` | Cursor · `composer-2.5` | `cursor:composer-2.5` |
| `cursor-luna-low` | Cursor · `luna-low` | `cursor:luna-low` |
| `cursor-luna-med` | Cursor · `luna-med` | `cursor:luna-med` |
| `cursor-luna-high` | Cursor · `luna-high` | `cursor:luna-high` |
| `cursor-grok47-med` | Cursor · `grok47-med` | `cursor:grok47-med` |
| `claude-composer-2.5` | Claude · `composer-2.5` (Haiku) | `claude:composer-2.5` |
| `claude-sonnet-5-5` | Claude · `claude-sonnet-5-5` | `claude:claude-sonnet-5-5` |
| `cursor-composer-2.5@medium` | Cursor · `composer-2.5` effort=medium | `cursor:composer-2.5@medium` |
| `cursor-composer-2.5@high` | Cursor · `composer-2.5` effort=high | `cursor:composer-2.5@high` |
| `cursor-luna-low@medium` | Cursor · `luna-low` effort=medium | `cursor:luna-low@medium` |
| `claude-composer-2.5@medium` | Claude · Haiku effort=medium | `claude:composer-2.5@medium` |

Config ids and slugs: [`wf-trial-model-specs.yaml`](../../../docs/demos/wf-trial-model-specs.yaml). Slug-only rows map via registry **Model slug** with overrides:

| `model_slug` (registry) | `config_id` when harness matches |
| --- | --- |
| `gpt-5.6-luna-medium-fast` | `luna-med` |
| `grok-4.7-medium-fast` | `grok47-med` |
| `claude-haiku-5-5` on claude harness | `composer-2.5` (matrix cell label Haiku) |
| `claude-sonnet-5-5` | `claude-sonnet-5-5` |

### Effort classification (per master row)

1. Readout link path: tokens `composer25medium`, `lunalowmedium`, `haiku55medium`, `luna-low-medium`, `claude-haiku55medium` → **`medium`**
2. Tokens `composer25high`, `composer25-high` → **`high`**
3. Else if linked readout contains `model_effort=medium` / `model_effort=high` → that tier
4. Else **no effort suffix** → baseline (`toolset_key` without `@`)

**Baseline vs effort:** Same slug may appear in both; effort classification is **only** from rules above (never from **Latest** alone).

---

## Matrix document structure

### Section title

`## Latest-run comparison matrix`

Place immediately **before** the `---` that precedes `## Footnotes`.

### Preamble (3–4 sentences)

- Facilitator cross-toolset index for **same PROMPT-WF-NN**
- Newest run per **`toolset_key`** (see footnote)
- Not effectiveness / not a leaderboard
- Full history: master table above

### Table

| Row | `PROMPT-WF-01` … `PROMPT-WF-08` | Each label links to [catalog trial prompt](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#trial-prompts) anchor |
| --- | --- | --- |

**Cell format:**

```html
<strong>{run_time}s</strong><br><strong>{grade_mean}</strong><br><a href="...">readout</a>
```

In Markdown: `**{run_time}s**<br>**{grade_mean}**<br>[readout]({path})`

| Field | Source |
| --- | --- |
| `run_time` | Master **Run time** or `—` |
| `grade_mean` | Two decimal places from leading mean in **Grades** |
| `readout` | Relative link from master row |

**Empty cell:** `—`

### Footnote (add one bullet under existing Footnotes)

Comparison matrix **`toolset_key`** includes optional **`model_effort`**; master **Latest** uses `(WF, harness, model_slug)` only — effort tiers may both show `Latest=yes` on the master table until reconciled.

---

## Build-plan phases (`@build-plan`)

| Phase | Action | Acceptance |
| --- | --- | --- |
| **1 — Parse** | Load master table rows from registry MD (skip WF with `Client ID` `—`) | Row count matches data rows (≈100) |
| **2 — Classify** | Map each row → `toolset_key` per § Effort + slug overrides | Effort batch rows land in `@medium` / `@high` columns, not baseline |
| **3 — Reduce** | Per `(wf, column_id)` keep max `client_id` | One source row per populated cell |
| **4 — Emit** | Run [`evidence/build-comparison-matrix.mjs`](./evidence/build-comparison-matrix.mjs); paste section | Column order = manifest |
| **5 — Verify** | [test-strategy.md](./test-strategy.md) | Spot cells pass |
| **6 — Optional link** | One line in catalog Recorded trials registry blurb | Points to comparison section |

---

## Do next

**`@build-plan`** — implement comparison section per phases above.

Sponsor commit: optional; not automatic.

---

## Changelog (this plan)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-09 | refine-plan | Locked column manifest, effort classification, `toolset_key` newest-run rule, cell format, build phases; resolved duration = wall clock. |
| 2026-11-09 | build-plan | `build-comparison-matrix.mjs`; registry comparison section + footnote; catalog link. |
