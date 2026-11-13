# PLAN — REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS

**Token:** `REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS`  
**Track:** `@add-feature` → **`@refine-plan`** (this pass) → **`@build-plan`** → `@close-out`  
**Parent matrix plan:** [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md)  
**Display contracts:** [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK](../../requirements/REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK.yaml) · [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES](../../requirements/REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES.yaml) (grades **format** only)  
**Primary deliverable:** Regenerated `## Latest-run comparison matrix` in [`docs/demos/traditional-workflow-trial-runs-registry.md`](../../../docs/demos/traditional-workflow-trial-runs-registry.md)  
**plan_phase:** `post-build`  
**depth_tier / gate_policy:** `minimal` / `advisory`

---

## Sponsor intent

Update each cell in the **Latest-run comparison matrix** so facilitators see:

| Line | Content |
| --- | --- |
| 1 | **wall_mins** — `Math.round(seconds / 60)` + literal **`m` suffix** (e.g. `19m`) |
| 2 | Full master **Grades** string — `{mean} · Req/Tr/Ts/Al/Pr/Ch/Ml` bands (not mean alone) |
| 3 | Relative **readout** link (unchanged) |

Master **Run time** column stays **seconds**. Only the pivot matrix section and its preamble change.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **wall_mins** | Integer minutes from master **Run time** via shared `formatWallClockMinutes`; displayed as `{n}m`. |
| **gradesDisplay** | Exact trimmed value of master table **Grades** column for the winning row per `(wf, toolset_key)` — **not** a second scrape from readout files (differs from batch Summary `grades` join). |
| **toolset_key** | Unchanged from [PLAN-WF-TRIAL-COMPARISON-MATRIX](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md) — newest run by max `client_id`. |
| **Generator** | [`build-comparison-matrix.mjs`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs) imports new render helper under `tools/bootstrap/lib/`. |

**Proof boundary:** Store documentation only — not methodology effectiveness, not a leaderboard, not REQ satisfaction. Matrix compares facilitator-recorded runs across toolsets; grade bands remain authoritative in readouts.

---

## Current vs target cell

```markdown
**1162s**<br>**3.87**<br>[readout](...)
```

→

```markdown
**19m**<br>**3.87 · A/A−/A/A/A−/A/A−**<br>[readout](...)
```

Preamble updates: describe **wall_mins** (`m` suffix) and full **Grades** line instead of seconds + mean only.

---

## Architecture

| Module | Change |
| --- | --- |
| [`formatWallClockMinutes`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) | Import only — no behavior change |
| **New** [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | `renderWfTrialComparisonMatrixCell({ wallSeconds, gradesDisplay, readout })` |
| [`build-comparison-matrix.mjs`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs) | Parse `gradesDisplay`; use renderer; update `SPOT_CHECKS` + `runCheck` |
| Registry MD | Regenerate matrix section via builder CLI |

```mermaid
flowchart LR
  MasterTable[Master runs table]
  Parse[parseMasterRows]
  Reduce[max client_id per cell]
  Render[renderWfTrialComparisonMatrixCell]
  Matrix[Comparison matrix section]
  MasterTable --> Parse --> Reduce --> Render --> Matrix
```

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | Mint REQ/ARCH/IMPL + semantic token; IMPL essence pseudocode |
| 2 | RED — [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) for **SC-WF-CMX-01…05** |
| 3 | GREEN — `wf-trial-comparison-matrix.mjs`; wire builder; migrate `SPOT_CHECKS` to `wallMins` + `gradesDisplay` fragments |
| 4 | Run builder → patch registry; `build-comparison-matrix.mjs --check` |
| 5 | Align [PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md](../PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md) + [test-strategy.md](../PLAN-WF-TRIAL-COMPARISON-MATRIX/test-strategy.md) cell-format bullets |
| 6 | LEAP CITDP to `tied-project/citdp/`; `tied_validate_consistency`; build-plan verification evidence |

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WF-CMX-01 | No populated matrix cell contains `NNNs` wall display |
| SC-WF-CMX-02 | Wall line uses `formatWallClockMinutes` + `m` suffix (`1162` → `19m`) |
| SC-WF-CMX-03 | Grade line equals master **Grades** for the winning row (includes `·` and slash bands) |
| SC-WF-CMX-04 | `build-comparison-matrix.mjs --check` passes with updated spot expectations |
| SC-WF-CMX-05 | Master table body unchanged (only comparison section + its preamble) |
| SC-WF-CMX-06 | Unit tests green; `tied_validate_consistency` ok after YAML sync |

---

## Spot-check table (builder `--check`)

After refine, hard-coded expectations use **`wallMins`** and **`gradesDisplay`** prefix (not raw seconds):

| wf | toolset_key | wallSeconds (source) | wallMins | gradesDisplay contains |
| --- | --- | --- | --- | --- |
| 08 | `cursor:composer-2.5` | 706 | `12m` | `3.57 ·` |
| 01 | `cursor:composer-2.5@medium` | 1125 | `19m` | `3.87 ·` |
| 03 | `cursor:composer-2.5@high` | 870 | `15m` | `3.87 ·` |
| 09 | `claude:composer-2.5@medium` | 296 | `5m` | `3.06 ·` |
| 10 | `claude:composer-2.5@medium` | 427 | `7m` | `3.29 ·` |
| 10 | `claude:claude-sonnet-5-5` | 723 | `12m` | `3.86 ·` (client `1794411691`; fixes stale SPOT_CHECKS expecting low run `1794366012`) |

`runCheck` must assert `gradesDisplay` on reduced row, not `gradeMean` alone.

---

## Out of scope

- Master **Run time** → minutes
- Re-scraping readouts for grades (use master column)
- `@record-wf-trial` / CI auto-regen (optional LEAP)
- New columns, `toolset_key` rules, or master **Latest** reconciliation
- `maturity_score`, leaderboard, or ranking language

---

## Risk

| Item | Consequence ladder |
| --- | --- |
| Wide table cells (long grade strings) | **Reversible** — facilitator doc; horizontal scroll acceptable |
| Drift if master **Grades** edited without regen | **Reversible** — re-run builder |
| Duplicate rounding logic | **Reversible** — import `formatWallClockMinutes` only |

---

## Do next

**`@close-out`** when ready — evidence: [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md).

---

## Changelog

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | add-feature | Intent: wall_mins + full grades in comparison matrix cells |
| 2026-11-13 | refine-plan | Locked grades source (master column), spot table, SC-WF-CMX-*, build sequence; WF-10 Sonnet spot aligned to `1794411691` |
| 2026-11-13 | build-plan | `wf-trial-comparison-matrix.*`; builder wired; registry matrix regen; CITDP persisted |
