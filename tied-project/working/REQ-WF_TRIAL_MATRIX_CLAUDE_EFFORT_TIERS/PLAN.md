# PLAN — REQ-WF_TRIAL_MATRIX_CLAUDE_EFFORT_TIERS

**Token:** `REQ-WF_TRIAL_MATRIX_CLAUDE_EFFORT_TIERS` (working name — facilitator doc; no store `[REQ-*]` YAML unless sponsor promotes)  
**Track:** `@add-feature` → `@refine-plan` → **`@build-plan`**  
**Parent:** [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS](../REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/PLAN.md) · [REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT](../REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT/PLAN.md) · [REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN](../REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN/PLAN.md) · [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md)  
**Trigger:** Sponsor: Sonnet 5.5 **high** column missing from **Latest-run comparison matrix**; Haiku/Sonnet **medium**/**high** readouts mis-bucketed under **`effort=low`** when manifest lacks `@medium`/`@high` keys (fallback in `toolsetKeyFromMasterRow`)  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `facilitator_doc_only` · **depth_tier:** `minimal`

---

## Sponsor intent

1. **Columns:** `Claude · claude-haiku-5-5 effort=high` and `Claude · claude-sonnet-5-5 effort=high` (`toolset_key` `claude:claude-haiku-5-5@high`, `claude:claude-sonnet-5-5@high`).
2. **Manifest:** Replace hand-maintained Claude low/medium entries with **`claudeEffortColumnSpecs()`** — for each of `claude-haiku-5-5`, `claude-sonnet-5-5` emit baseline + `@medium` + `@high` (**6** Claude columns). Cursor block unchanged (**7** columns) → **13** total.
3. **Pivot:** When `effortFromReadout` yields **`medium`** or **`high`**, map only to existing `@` column keys — **no fallback** to baseline `effort=low` (composer pivot unchanged).
4. **Layout:** Alphabetical headers via existing `MATRIX_COLUMNS` `.sort(localeCompare)`; footer === header (**SC-WF-CMX-15**).

Static manifest (not registry-driven column discovery).

---

## Root cause

| Layer | Issue |
| --- | --- |
| Manifest | No `@high` keys for Claude Haiku/Sonnet; Sonnet `@medium` was added ad hoc (11 columns) without generator |
| `toolsetKeyFromMasterRow` | If `matrixKeyToColumn.has(keyed)` is false, returns **baseline** key → high/medium cells under wrong header |
| Builder spot check WF-10 | Sonnet **1794411691** keyed to `claude:claude-sonnet-5-5` (low), not `@high` |
| Matrix WF-10 row | Haiku **1794409094** in Haiku **low** column; Sonnet **1794411691** in Sonnet **low** column |

`effortFromReadout` already classifies `claudesonnet55high` / `haiku55high` / `model_effort=high` (**PLAN-WF-TRIAL-COMPARISON-MATRIX** effort rules).

---

## Target column manifest (13)

| `toolset_key` | Target header |
| --- | --- |
| `claude:claude-haiku-5-5` | Claude · `claude-haiku-5-5` effort=low |
| `claude:claude-haiku-5-5@medium` | Claude · `claude-haiku-5-5` effort=medium |
| `claude:claude-haiku-5-5@high` | Claude · `claude-haiku-5-5` effort=high |
| `claude:claude-sonnet-5-5` | Claude · `claude-sonnet-5-5` effort=low |
| `claude:claude-sonnet-5-5@medium` | Claude · `claude-sonnet-5-5` effort=medium |
| `claude:claude-sonnet-5-5@high` | Claude · `claude-sonnet-5-5` effort=high |

Plus existing Cursor keys: `cursor:composer-2.5`, `cursor:grok47-low`, `cursor:grok47-med`, `cursor:luna-high`, `cursor:luna-low`, `cursor:luna-low@medium`, `cursor:luna-med`.

---

## Modules

| Path | Change |
| --- | --- |
| [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | `CLAUDE_EFFORT_TIERED_CONFIGS`, exported `claudeEffortColumnSpecs()`; compose `MATRIX_COLUMN_SPECS`; remove tier→baseline fallback |
| [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-11 → **13**; **SC-WF-CMX-22…26**; keep 16–21, 19 regressions |
| [`build-wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs) | Spot checks: WF-10 `@high` keys; update WF-10 sonnet spot from baseline → `@high` |
| [`traditional-workflow-trial-runs-registry.md`](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md) | Regenerated matrix + footnote (Claude effort tiers) |
| [`PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md) | Column table + effort rules cross-ref |
| [`tied-project/CHANGELOG.md`](../../CHANGELOG.md) | Unreleased bullet |

**Merge note:** Fold uncommitted Sonnet `@medium` one-off into `claudeEffortColumnSpecs()` during build (single manifest source).

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-CMX-11 | **13** distinct matrix column headers |
| SC-WF-CMX-14 | Headers strictly alphabetical; Claude before Cursor |
| SC-WF-CMX-15 | Footer header row === top header row |
| SC-WF-CMX-20 | Sonnet medium readout → `claude:claude-sonnet-5-5@medium` (retain) |
| SC-WF-CMX-22 | Sonnet high readout → `claude:claude-sonnet-5-5@high`, ≠ baseline |
| SC-WF-CMX-23 | Haiku high readout → `claude:claude-haiku-5-5@high` |
| SC-WF-CMX-24 | Both Claude `effort=high` headers present |
| SC-WF-CMX-25 | Sonnet **low** column WF-01…08: baseline/low readouts only (medium cells moved) |
| SC-WF-CMX-26 | With `@medium` absent from manifest stub, medium-classified row → `null` key (no baseline fallback) |
| SC-WF-CMX-10…13, 16–19 | Effort headers, composer pivot, grok47 regressions |

**Registry spot checks (post-regen):**

| WF | `toolset_key` | Wall | Grades fragment | Readout id |
| --- | --- | --- | --- | --- |
| 10 | `claude:claude-haiku-5-5@high` | **14m** | **3.71 ·** | **1794409094** |
| 10 | `claude:claude-sonnet-5-5@high` | **12m** | **3.86 ·** | **1794411691** |
| 10 | `claude:claude-sonnet-5-5` | — or older **low** run only | — | not **1794411691** |
| 09 | `claude:claude-sonnet-5-5@high` | **13m** (799s) | **3.63 ·** | **1794353174** |
| 09 | `claude:claude-sonnet-5-5` | **4m** | **3.33 ·** | **1794586024** (low) |

---

## Implementation order (`@build-plan`)

1. **Tests first (RED):** SC-WF-CMX-11 (13), 22–26; adjust builder spot checks.
2. **Matrix module:** `claudeEffortColumnSpecs()` + remove fallback.
3. **Regen:** `build-wf-trial-comparison-matrix.mjs`; optional `@publish-wf-trial-summaries`.
4. **Docs:** registry footnote, PLAN-WF-TRIAL-COMPARISON-MATRIX, CHANGELOG.

---

## Verification

```bash
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
```

Evidence target: `evidence/build-plan-verification-evidence.md`

---

## Out of scope

- Store TIED REQ/ARCH/IMPL promotion
- Dynamic columns without manifest entry
- Cursor MODEL_EFFORT `@high` columns
- `claude-sonnet-4-6` / other Sonnet generations (separate config ids later)

---

## Do next

Optional **`@close-out`** / sponsor commit. Evidence: [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md).

---

## Changelog

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-14 | add-feature | Sponsor: Sonnet high + declarative Claude effort columns |
| 2026-11-14 | refine-plan | PLAN, CITDP, test-strategy, tracker; spot checks WF-09/10; pivot no-fallback |
| 2026-11-14 | build-plan | `claudeEffortColumnSpecs`; 13 columns; pivot no-fallback; registry regen |