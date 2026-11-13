# PLAN — REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS

**Token:** `REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS`  
**Track:** `@add-feature` → `@refine-plan` → **`@build-plan`**  
**Parent:** [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md)  
**Compose:** [REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX](../REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX/PLAN.md) (Haiku slug labels — post-build)  
**Primary deliverable:** **9** comparison matrix column headers — **harness · config · MODEL_EFFORT** where effort applies; **composer-2.5** unnamed  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal`

---

## Sponsor intent

Each matrix column heading must be **unique** on **harness**, **catalog config id**, and **MODEL_EFFORT** where that model supports operator effort tiers.

**Tiered models (Luna, Haiku overlays, etc.):** Baseline columns (no `@` on `toolset_key`) display **`effort=low`**; `@medium` / `@high` keys display matching **`effort=`** suffix. Only **header display** and manifest metadata change; overlay keys unchanged for non-composer models.

**composer-2.5 exception (2026-11-13 refine):** Single implicit tier — header stays `Cursor · `composer-2.5`` with **no** `effort=` clause. Prior `cursor:composer-2.5@medium` and `@high` columns and filename tokens `composer25medium` / `composer25high` are **misdirected**; pivot always maps composer rows to `cursor:composer-2.5`. Named `effort=middle` is **not** used (unnamed suffices for uniqueness). Aligns with [`tied-project/vocab/agentstream.md`](../../../vocab/agentstream.md) (`composer-2.5*` ignored for `MODEL_EFFORT`).

**Manifest shrink:** Drop two composer overlay columns → **9 × 8** matrix (was 11 × 8).

**Note:** Config ids `luna-low` / `luna-med` / `grok47-med` are model speed tiers, not MODEL_EFFORT; their baseline columns still show `effort=low` in header text.

---

## Column manifest (target)

| `column_id` | Target header | `toolset_key` |
| --- | --- | --- |
| `cursor-composer-2.5` | Cursor · `composer-2.5` | `cursor:composer-2.5` |
| `cursor-luna-low` | Cursor · `luna-low` effort=low | `cursor:luna-low` |
| `cursor-luna-med` | Cursor · `luna-med` effort=low | `cursor:luna-med` |
| `cursor-luna-high` | Cursor · `luna-high` effort=low | `cursor:luna-high` |
| `cursor-grok47-med` | Cursor · `grok47-med` effort=low | `cursor:grok47-med` |
| `claude-haiku-5-5` | Claude · `claude-haiku-5-5` effort=low | `claude:claude-haiku-5-5` |
| `claude-sonnet-5-5` | Claude · `claude-sonnet-5-5` effort=low | `claude:claude-sonnet-5-5` |
| `cursor-luna-low@medium` | Cursor · `luna-low` effort=medium | `cursor:luna-low@medium` |
| `claude-haiku-5-5@medium` | Claude · `claude-haiku-5-5` effort=medium | `claude:claude-haiku-5-5@medium` |

**Removed:** `cursor-composer-2.5@medium`, `cursor-composer-2.5@high`.

---

## Example headers

| `toolset_key` | Target header |
| --- | --- |
| `claude:claude-haiku-5-5` | ``Claude · `claude-haiku-5-5` effort=low`` |
| `claude:claude-haiku-5-5@medium` | ``Claude · `claude-haiku-5-5` effort=medium`` |
| `cursor:composer-2.5` | ``Cursor · `composer-2.5` `` (no effort) |
| `cursor:luna-med` | ``Cursor · `luna-med` effort=low`` |

---

## Architecture

| Module | Change |
| --- | --- |
| [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | Shrink `MATRIX_COLUMNS`; `effortTier` per column; `formatMatrixColumnHeader()`; composer pivot guard in `effortFromReadout` / `toolsetKeyFromMasterRow` |
| [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-10…13 |
| [`build-comparison-matrix.mjs`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs) | Consumer of derived headers; 9-column sync |
| Registry | Regenerated matrix section |
| Parent [`PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md) | LEAP manifest + effort rules for composer |

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-CMX-10 | Non-composer headers match `/effort=(low\|medium\|high)/`; composer header must **not** contain `effort=` |
| SC-WF-CMX-11 | Exactly **9** headers, pairwise distinct |
| SC-WF-CMX-12 | Haiku baseline === ``Claude · `claude-haiku-5-5` effort=low`` |
| SC-WF-CMX-13 | Readout paths with `composer25medium` or `composer25high` map to `cursor:composer-2.5`, never `@medium`/`@high` keys |
| SC-WF-CMX-04 | Builder `--check` exit 0 |
| SC-WF-CMX-05 | Master table unchanged |

---

## Build sequence (`@build-plan`)

1. RED SC-WF-CMX-10…13  
2. GREEN manifest shrink, pivot guards, `effortTier` + `formatMatrixColumnHeader`  
3. Regen registry + `--check`  
4. LEAP parent PLAN manifest  
5. Verification evidence  

---

## Out of scope

- `toolset_key@low`  
- New columns for `claude-sonnet-4-6`  
- `@record-wf-trial` auto-regen  
- Rewriting master-table rows or readout filenames (`composer25medium` artifacts remain in history)

---

## Do next

**`@build-plan`** linked to this folder.

---

## Changelog

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | add-feature | Intent: effort on column headings; baseline effort=low |
| 2026-11-13 | handoff | Working folder on disk |
| 2026-11-13 | refine-plan | Composer 2.5 unnamed effort; 9-column manifest; SC-WF-CMX-13 pivot |
| 2026-11-13 | build-plan | Shipped module, tests, registry, parent PLAN LEAP |
