# Plan — traditional workflow trial runs registry

| Field | Value |
| --- | --- |
| **Working token** | `PLAN-WF-TRIAL-RUNS-REGISTRY` |
| **plan_phase** | `post-build` |
| **Refined** | 2026-11-08 (`@refine-plan`) |
| **Change class** | Facilitator **doc-only** — **no `[REQ-*]` mint** |
| **Primary deliverable** | [`docs/demos/traditional-workflow-trial-runs-registry.md`](../../../docs/demos/traditional-workflow-trial-runs-registry.md) |
| **Source of truth for rows** | [Recorded trials](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) (56 rows) |
| **Naming authority** | [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../../../tied-project/requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml) · [`build_wf_trial_disposable_tag`](../../../scripts/lib/wf-trial-disposable-tag.inc.sh) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **Tracker** | None (docs-only; no checklist copy required) |

**profile_depth:** `minimal` · **gate_policy:** `facilitator_doc_only` · **depth_tier:** `minimal`

---

## Refine (Touchpoint 1 — RESOLVE)

**Invocation:** Sponsor Cursor plan for a **trial runs registry**; clarified via questionnaire (2026-11-08).

| Sponsor term | Resolved meaning |
| --- | --- |
| **workflow trial range / batch** | Informal label for orchestrated matrix cells (`workflow-trial-agentstream` + disposable tag). Normative tag shape is **`wf-agentstream-{wf-id}-{harness}-{modelBucket}`**, not a separate `workflow_trial_range` shell symbol in this repo. |
| **TIED client ID** | Leading **epoch** integer in disposable dirname (e.g. `1794048393`). |
| **Dir name / factory tag** | Full dirname `{epoch}-{tag}`; **factory tag** = suffix after first `-` following epoch (registry uses full dirname in one column, tag in adjacent column when helpful). |
| **Harness** | Matrix key: `cursor` \| `claude` \| `manual-IDE` \| `mixed` (cohort only). Agentstream readouts use long labels (`cursor-agentstream-four-phase`); registry stores **short key** + optional note in preamble. |
| **Model** | **`model_config`** (catalog config id or cohort label) + **`model_slug`** (exact id from readout when present). |
| **Grades** | Seven letter bands from each linked readout `## Session grading` only — **no** composite score, **no** maturity proxy ([grading rubric](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout)). |
| **Latest for cell** | Single master column: `yes` \| `no` \| `n/a` — max `client_id` within `(PROMPT-WF-NN, harness_key, model_config_key)`. |

### Locked scope (sponsor)

| Decision | Choice |
| --- | --- |
| Row inventory | **Catalog Recorded trials only** (~57 rows). **Do not** expand WF-01 / WF-02 cohort rows into per-client rows. |
| Duplicate cells | **One table** with `latest_for_cell` column — **no** second “latest only” summary table. |
| Orphan readouts | Exclude `trial-readout-*.md` not linked from a Recorded trials row (even if on disk). |

### Out of scope

- Permanent generator script in repo (one-off extraction during **build** is fine).
- Mutating disposable clients or re-running trials.
- Project REQ/ARCH/IMPL YAML.

**Consequence ladder:** Doc edit = **reversible**. Wrong grade scrape = fix registry markdown; readouts remain authoritative.

---

## Naming eras (`tag_era`)

| `tag_era` | Pattern | Example dirname |
| --- | --- | --- |
| `standard` | `{epoch}-wf-agentstream-wf-NN-{harness}-{modelBucket}` | `1794048393-wf-agentstream-wf-01-cursor-composer25` |
| `legacy-short` | `{epoch}-wf-agentstream-wf-NN` | `1793604353-wf-agentstream-wf-01` |
| `legacy-manual` | `{epoch}-wf-NN-{model-suffix}` | `1793562432-wf-02-composer25` (WF-02 cohort range only in summary row) |
| `cohort-summary` | Wildcard / ellipsis in catalog | WF-01 seven IDE row; WF-02 nine-model row |

**modelBucket** (orchestrator): lowercase `MODEL_CONFIG`, else normalized `MODEL_SLUG` (strip `.` and `-`). Document mismatch cases (e.g. dirname `lunamed` vs config `luna-med`, `gpt56lunamediumfast` vs `luna-med`) in registry footnote — dirname is **identity**, config id is **matrix key**.

---

## `model_config_key` normalization (for `latest_for_cell`)

Derive from catalog **Model config** column first; override from readout `**Model config**` when present.

| Catalog prose (examples) | `model_config_key` |
| --- | --- |
| `Cursor agentstream / Composer 2.5` | `composer-2.5` |
| `GPT-5.6 Luna low` / `… Luna high` / `… Luna med` | `luna-low` / `luna-high` / `luna-med` |
| `Claude Haiku 5.5` / `Claude Sonnet 5.5` | `claude-haiku-5.5` / `claude-sonnet-5.5` |
| `seven IDE + agentstream orchestrator` | `cohort-wf01` |
| `nine-model cohort` | `cohort-wf02` |
| `agentstream orchestrator` (legacy WF-03 row) | `composer-2.5` (from readout) |

**`latest_for_cell`:** For each group sharing `(prompt, harness_key, model_config_key)`, set `yes` on **maximum numeric `client_id`**; others `no`. Cohort rows: `n/a`.

**Known duplicate groups (build must verify):**

| Group | Members (client_id) | Expected `yes` |
| --- | --- | --- |
| WF-01 · cursor · composer-2.5 | 1794044147, 1794048393 | 1794048393 |
| WF-01 · cursor · luna-high | 1794075385, 1794091020 | 1794091020 |
| WF-03 · cursor · composer-2.5 | 1793605811, 1793817075, 1793820250 | 1793820250 |
| WF-03 · claude · claude-sonnet-5.5 | 1793848636, 1794102131 | 1794102131 |
| WF-04 · claude · claude-sonnet-5.5 | 1793852946, 1794102400 | 1794102400 |
| WF-05 · cursor · composer-2.5 | 1794042383, 1794049382 | 1794049382 |
| WF-05 · claude · claude-sonnet-5.5 | 1794055754, 1794066499, 1794066889, 1794102708 | 1794102708 |
| WF-08 · claude · claude-sonnet-5.5 | 1794069919, 1794103645 | 1794103645 |

---

## Registry document structure

### Header metadata

Purpose, disclaimer (not REQ, not leaderboard), **Last updated**, link back to workflow catalog, row count assertion (**57**).

### §1 Naming reference

Compact table (eras above) + link to REQ and orchestrator script.

### §2 Master runs table

**Row order:** Same as Recorded trials table (lines 257–313), including the split after WF-08 luna-high block (row for `1794093680` WF-03).

**Columns (build):**

| Column | Notes |
| --- | --- |
| Prompt | `PROMPT-WF-NN` |
| Client ID | Epoch or `—` |
| Dir name | Primary backtick dirname from catalog |
| Tag era | `standard` \| `legacy-short` \| `legacy-manual` \| `cohort-summary` |
| Harness | `cursor` \| `claude` \| `manual-IDE` \| `mixed` |
| Model config | Normalized key |
| Model slug | From readout or `—` |
| Stack | `wf-trial-ts-node-test-v1` / waiver / `—` |
| Outcome | Short workflow label from catalog parenthetical |
| Orc exit | `0` / `1` / `—` |
| Grades | Compact `Req/Tr/Ts/Al/Pr/Ch/Ml` e.g. `A/A−/A/A/A−/A/A−` or `—` |
| Latest | `yes` \| `no` \| `n/a` |
| Readout | Relative link |

**Cohort rows (2):**

| Prompt | Harness | Model config | Grades | Latest |
| --- | --- | --- | --- | --- |
| PROMPT-WF-01 | `mixed` | `cohort-wf01` | `—` | `n/a` |
| PROMPT-WF-02 | `manual-IDE` | `cohort-wf02` | `—` | `n/a` |

Per-client letter bands for WF-02 remain in the nine readouts; comparison page does not replace registry grades on the summary row.

### §3 Footnotes

- Grade source = readout on record date of build.
- Forbidden: maturity_score, weighted rollup.
- Future-test rule (one sentence, from readout pattern).

---

## Build-plan phases (`@build-plan`)

| Phase | Action | Acceptance |
| --- | --- | --- |
| **1 — Extract** | Parse 57 catalog rows; resolve readout links | Row list JSON or checklist in `evidence/` optional |
| **2 — Scrape** | For each linked `trial-readout-PROMPT-WF-*.md`, read metadata + Session grading | 55+ single-client rows populated; 2 cohort `—` |
| **3 — Flag** | Compute `latest_for_cell` | Exactly one `yes` per duplicate group in table above |
| **4 — Author** | Write `traditional-workflow-trial-runs-registry.md` | [test-strategy.md](./test-strategy.md) checks pass |
| **5 — Link** | Catalog Recorded trials intro + `docs/demos/README.md` | Backlinks present |

**Optional:** One-off `rg`/awk transcript in `tied-project/working/PLAN-WF-TRIAL-RUNS-REGISTRY/evidence/grade-scrape.tsv` for audit; not required in git long-term.

---

## Do next

**`@build-plan`** — implement registry markdown and cross-links per phases above.

Sponsor commit: optional; not automatic.

---

## Changelog (this plan)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-08 | refine-plan | Locked catalog-literal rows, `latest_for_cell` column only; naming eras + model_config normalization; duplicate-group expectations. |
| 2026-11-08 | build-plan | Published `traditional-workflow-trial-runs-registry.md`; catalog + README links; grade-scrape.tsv. |
