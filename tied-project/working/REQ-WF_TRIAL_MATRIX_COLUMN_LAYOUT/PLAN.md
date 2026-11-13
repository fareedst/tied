# PLAN — REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT

**Token:** `REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT`  
**Track:** `@add-feature` (implicit) → **`@build-plan`** (retroactive; refine-plan skipped — no prior linked plan)  
**Parent:** [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS](../REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/PLAN.md) · [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md)  
**Change class:** Facilitator registry layout — **no new `[REQ-*]` YAML mint** unless sponsor promotes  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `facilitator_doc_only` · **depth_tier:** `minimal`

---

## Sponsor intent

Improve human scanability of **Latest-run comparison matrix** in [`traditional-workflow-trial-runs-registry.md`](../../../docs/demos/traditional-workflow-trial-runs-registry.md):

1. **Column order:** Sort toolset columns **alphabetically by header text** (at current labels, all **Claude** columns precede all **Cursor** columns).
2. **Footer row:** Repeat the header row as the **last data row** so long tables remain readable in plain Markdown (no sticky headers).

Master table unchanged. Same **9** `toolset_key` columns as effort-headers manifest.

---

## Modules

| Path | Change |
| --- | --- |
| [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | `MATRIX_COLUMNS` sorted with `localeCompare` on `header` |
| [`build-wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs) | Append repeated header row; export `buildMatrixSection` for tests |
| [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-14, SC-WF-CMX-15 |
| Registry | Regenerated matrix section + footnote bullet on layout |

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-CMX-14 | `MATRIX_COLUMNS` headers are strictly alphabetical; first header starts with `Claude`; all `Claude` before any `Cursor` |
| SC-WF-CMX-15 | Generated matrix table’s last `\|` row equals the header row (excludes `---` separator) |
| SC-WF-CMX-04 | `build-wf-trial-comparison-matrix.mjs --check` exit 0 |
| SC-WF-CMX-10…13 | Effort-header regression (unchanged) |

---

## Verification

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
```

Evidence: [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md)

---

## Do next

**`@close-out`** when sponsor wants CHANGELOG + commit (optional `citdp-promote` only if full TIED YAML is required).

---

## Changelog

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | add-feature | Sponsor: alphabetical columns + repeated header row |
| 2026-11-13 | build-plan | Retroactive PLAN; implementation verified on disk |
