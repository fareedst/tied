# PLAN — REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN

**Token:** `REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN` (working name — facilitator doc; no store `[REQ-*]` YAML unless sponsor promotes)  
**Track:** `@refine-plan` → **`@build-plan`**  
**Parent:** [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS](../REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/PLAN.md) · [REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT](../REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT/PLAN.md) · [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md)  
**Trigger:** Mis-placed **PROMPT-WF-09** readout `@1794608051` (`grok-4.7-low-fast`) under **`cursor:grok47-med`** after `@publish-wf-trial-summaries`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `facilitator_doc_only` · **depth_tier:** `minimal`

---

## Sponsor intent

1. **Column:** Add a dedicated comparison-matrix column **`Cursor · `grok47-low` effort=low`** (`toolset_key` **`cursor:grok47-low`**).
2. **Placement:** **PROMPT-WF-09 @ 1794608051** is the only cell in that column for WF-09 (until a newer low run exists).
3. **Pivot:** Stop mapping all Grok slugs to **`grok47-med`**; **`grok-4.7-low-fast`** → **`grok47-low`**, medium unchanged.
4. **Column order:** New column follows [REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT](../REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT/PLAN.md) — **alphabetical by header** via existing `MATRIX_COLUMNS` `.sort(localeCompare)`; **`grok47-low`** immediately **before** **`grok47-med`** among Cursor headers; footer row matches sorted header (**SC-WF-CMX-15**).

Static manifest extension (not dynamic column discovery).

---

## Root cause (resolved in refine)

| Layer | Issue |
| --- | --- |
| Manifest | Only **`cursor:grok47-med`** in `MATRIX_COLUMN_SPECS` (**9** columns) |
| `SLUG_TO_CONFIG` | Missing **`grok-4.7-low-fast`** |
| `configIdFromMasterRow` | `row.slug.includes("grok")` → **`grok47-med`** |
| Builder | `matrixKeyToColumn.has(key)` drops unknown keys; wrong key lands in med column |

[`deriveCursorModelConfig`](../../../tools/bootstrap/lib/wf-trial-model-catalog.mjs) already yields **`grok47-low`** for **`grok-4.7-low-fast`**; matrix module does not use it.

---

## Modules

| Path | Change |
| --- | --- |
| [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | Add **`cursor-grok47-low`** spec; `SLUG_TO_CONFIG`; refactor **`configIdFromMasterRow`** (cursor harness → **`deriveCursorModelConfig`**) |
| [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-11 → **10** cols; **SC-WF-CMX-16…19** |
| [`build-wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs) | **SC-WF-CMX-04** spot check WF-09 **`cursor:grok47-low`** |
| [`traditional-workflow-trial-runs-registry.md`](../../../docs/demos/traditional-workflow-trial-runs-registry.md) | Regenerated matrix section + footnote bullet (low vs med toolset keys) |
| [`trial-readout-PROMPT-WF-09-grok47low-1794608051-…`](../../../docs/demos/trial-readout-PROMPT-WF-09-grok47low-1794608051-wf-agentstream-wf-09-cursor-grok47low.md) | Cohort note: matrix column exists after fix |

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-CMX-11 | **10** distinct matrix column headers |
| SC-WF-CMX-14 | Headers strictly alphabetical; Claude before Cursor |
| SC-WF-CMX-15 | Footer header row === top header row |
| SC-WF-CMX-16 | `grok-4.7-low-fast` master row → **`cursor:grok47-low`** |
| SC-WF-CMX-17 | Same row **≠** **`cursor:grok47-med`** |
| SC-WF-CMX-18 | `grok-4.7-medium-fast` → **`cursor:grok47-med`** |
| SC-WF-CMX-19 | Header index **`grok47-low`** = header index **`grok47-med`** − 1 |
| SC-WF-CMX-04 | Three-line cell contract unchanged |
| SC-WF-CMX-10…13 | Effort-header + composer pivot regression |

**Registry spot checks (post-regen):**

- WF-09 **`grok47-low`:** **12m**, grades **2.56**, readout **1794608051**
- WF-09 **`grok47-med`:** **—**
- WF-10: low **1794522969** in low column; med **1794525072** in med column

---

## Implementation order (`@build-plan`)

1. **Tests first (RED):** SC-WF-CMX-11, 16–19 before manifest/pivot edits.
2. **Matrix module:** manifest + pivot.
3. **Spot checks** in builder.
4. **Regen:** `build-wf-trial-comparison-matrix.mjs`; `@publish-wf-trial-summaries` (or publish orchestrator only).
5. **Docs:** registry footnote; readout cohort line.

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

- Dynamic columns from master rows without manifest edit
- **`grok46-low`** matrix column (pivot fix still helps if added later)
- Master row for **WF-01 @ 1794531738** (catalog-only today)

---

## Do next

Optional **`@close-out`** / sponsor commit.

Evidence: [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md)

---

## Changelog

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | refine-plan | PLAN from sponsor matrix mis-placement + alphabetical column rule |
| 2026-11-13 | build-plan | `grok47-low` column + pivot; SC-WF-CMX-16…19; registry regen |
