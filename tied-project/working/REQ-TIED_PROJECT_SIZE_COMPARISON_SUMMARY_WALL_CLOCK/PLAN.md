# PLAN — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK

**Token:** `REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK`  
**Track:** `@add-feature` → `@refine-plan` → `@build-plan` → `@close-out`  
**Parent:** [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT](../REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT/PLAN.md) (closed @ `652c81a2`)  
**Facilitator:** [project-size-batch-discover-compare](../../non-tied-plans/project-size-batch-discover-compare/PLAN.md)  
**plan_phase:** `pre-implementation`  
**depth_tier / gate_policy:** `minimal` / `advisory`

---

## Sponsor intent

Rename the last Summary column from **`wall_time`** to **`wall_clock`** and display orchestrator duration as **nearest integer minutes** (`Math.round(seconds / 60)`). Source seconds remain on receipt JSON (`trial_factors.orchestrator_wall_time_seconds`). Missing → `—`.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **wall_clock** | Summary column: display minutes from orchestrator wall seconds. |
| **formatWallClockMinutes** | Pure formatter; `null`/non-finite → `null` for em dash at render. |

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-CWC-01 | Summary last column header is `wall_clock`. |
| SC-CWC-02 | Cell is nearest integer minutes; `—` when unavailable. |
| SC-CWC-03 | Glossary defines `wall_clock` minutes; receipts keep seconds. |
| SC-CWC-04 | Render tests green; `993.6` s → `17`. |
| SC-CWC-05 | Regenerated comparison-table reflects minutes (e.g. wf-06 **17** not **994**). |
| SC-CWC-06 | `tied_validate_consistency` ok. |

---

## Build sequence

1. RED tests SC-CWC-01…04
2. `formatWallClockMinutes` + glossary/header rename in render
3. Regen evidence (`--include-trial-factors`, `--summary-epoch-min 1794259000`)
4. TIED LEAP + validate
5. Scoped close-out

---

## Out of scope

- Receipt/schema changes; verbose table new columns; CLI unit flag.
