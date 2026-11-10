# PLAN — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT

**Token:** `REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT`  
**Track:** `@add-feature` → `@refine-plan` (v2 cohort) → **`@build-plan`** → `@close-out`  
**Parent:** [REQ-TIED_PROJECT_SIZE_LAYERS](../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md) (v1 closed; additive facilitator UX)  
**Facilitator:** [project-size-batch-discover-compare](../../non-tied-plans/project-size-batch-discover-compare/PLAN.md)  
**Linked Cursor plan:** `.cursor/plans/comparison_summary_cohort_577194c9.plan.md`  
**plan_phase:** `pre-implementation` (v2 cohort rules — v1 trim/integer already on disk, uncommitted)  
**depth_tier / gate_policy:** `minimal` / `advisory`

---

## Sponsor intent

### v1 (built on disk; uncommitted)

Improve scanability of batch comparison **Summary** and **Expanded metrics** (`--verbose-table`):

| Change | Rule |
| --- | --- |
| **Label trim** | Display label = `/(wf-\d{2}-.+)$/i` suffix on discover basename; else full label (`stdd-store`). |
| **Remove `ok`** | No `ok` column; Summary only `receipt.ok === true`. |
| **Cross-layer precision** | `oi/atom`, `utf8/atom`, `pf/atom` rounded to **nearest integer** in table (`CROSS_LAYER_DECIMALS = 0`). |
| **Summary columns (14)** | `label`, atoms, OI, proof facets, three cross-layer ratios — **no** Summary `verify_ev` (verbose only). |

### v2 (refine-plan — locked 2026-11-10)

Cohort **Summary** for WF matrix comparison ([comparison-table.md](../../non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)):

| Change | Rule |
| --- | --- |
| **Epoch floor** | Include Summary row only when `parseEpochFromBasename(label) > summaryEpochMin` (strict `>`). Default CLI **`1794259000`**. No parseable epoch → **exclude**. |
| **Dedupe by display label** | After filter, group by `trimComparisonDisplayLabel(label)`; keep row with **largest** basename epoch. |
| **Sort** | `sortSummaryRowsByDisplayLabel` on deduped set (display label, then full basename). |
| **`wall_time` column** | Last Summary column; orchestrator wall seconds from `trial_factors.orchestrator_wall_time_seconds` (snapshot with `--include-trial-factors`); optional render-time hydration from disposable `wf-trial-orchestrator-run.v1.json`; `Math.round`; `—` if missing. |
| **CLI** | `--summary-epoch-min N` on [`project-size-batch-compare.mjs`](../../../tools/bootstrap/lib/project-size-batch-compare.mjs); persist `summary_epoch_min` in `manifest.v1.json` `options`. |

**Sponsor choice:** v2 applies to **Summary** and **verbose** row sets (same `prepareComparisonSummaryRows` pipeline). Failed/skipped bullets keep **full** discover basename.

**Proof boundary:** Unchanged — descriptive facilitator markdown only. Manifest `targets[].label`, receipt paths, and JSON numerics stay **full precision**; dedupe is **display-only**.

**Cohort note (50 receipts @ floor 1794259000):** ~20 rows before dedupe (~16 unique display labels after dedupe, estimate).

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **Discover basename** | `target.label` (e.g. `{epoch}-wf-agentstream-wf-06-cursor-composer25high`). |
| **Discover epoch** | Leading digits from basename via `parseEpochFromBasename` ([discover-clients](../../../tools/bootstrap/lib/project-size-discover-clients.mjs)). |
| **Display label** | `trimComparisonDisplayLabel(basename)`. |
| **summaryEpochMin** | CLI floor; default `1794259000` for current sponsor matrix. |
| **Wall time** | `finished_at − started_at` from `wf-trial-orchestrator-run.v1.json`, stored on receipt as `trial_factors.orchestrator_wall_time_seconds`. |

---

## Refinements (v1 — complete on disk)

1. `trimComparisonDisplayLabel`, `SUMMARY_LABEL_SUFFIX_RE`, `sortSummaryRowsByDisplayLabel`.
2. `CROSS_LAYER_DECIMALS = 0` (integer cross-layer display).
3. Glossary + no forbidden phrases; verbose table shares trim rule.
4. Tokens `REQ/ARCH/IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT`; parent LAYERS `related_to`.

## Refinements (v2 — build-plan)

1. **`prepareComparisonSummaryRows(rows, { summaryEpochMin })`** — filter → dedupe → sort; export for tests.
2. **`orchestratorWallTimeSeconds(receipt)`** — read `trial_factors`, optional repo hydration.
3. **Snapshot:** extend `TrialFactorsAnnex` + `readTrialFactors` in [snapshot-builder.ts](../../../mcp-server/src/project-size/snapshot-builder.ts); unit test fixture timestamps.
4. **Batch CLI:** `--summary-epoch-min`; pass `summaryEpochMin` into `renderComparisonMarkdown`; document in [non-tied PLAN](../../non-tied-plans/project-size-batch-discover-compare/PLAN.md) CLI table (build step).
5. **Regen evidence:** batch with `--include-trial-factors` and `--summary-epoch-min 1794259000` (full rediscover acceptable; no hand-edit table).
6. **Glossary:** update Summary intro (floor, dedupe, sort); add **wall_time** row; note unique display labels in Summary after dedupe.
7. **LEAP:** update CITDP `desired_behavior`, REQ acceptance through **SC-CSC-10**; IMPL pseudo-code blocks for prepare + wall time.

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-CSC-01 | Summary has no `ok` column; only successful receipts considered before prepare pipeline. |
| SC-CSC-02 | Summary and verbose first column use trimmed suffix when regex matches. |
| SC-CSC-03 | Labels without match render verbatim. |
| SC-CSC-04 | Cross-layer cells integer-rounded; `—` for null/non-finite. |
| SC-CSC-05 | Glossary documents display label, epoch floor, dedupe, wall_time. |
| SC-CSC-06 | `project-size-comparison-render.test.mjs` green; `tied_validate_consistency` ok after YAML sync. |
| SC-CSC-07 | Epoch filter: `1794259000` dropped, `1794259001` kept when `summaryEpochMin=1794259000`. |
| SC-CSC-08 | Dedupe: same display label → row with higher discover epoch wins. |
| SC-CSC-09 | `wall_time` is last Summary column; rounded seconds (e.g. 994 from sample ISO pair). |
| SC-CSC-10 | `summaryEpochMin: 0` (or omit) retains dogfood `stdd-store` row in tests. |

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | RED tests SC-CSC-07…10 + snapshot trial_factors wall time |
| 2 | Implement `prepareComparisonSummaryRows`, wall column, CLI flag |
| 3 | Implement snapshot `orchestrator_wall_time_seconds`; `npm run build` mcp-server |
| 4 | Regen `comparison-table.md` + `manifest.v1.json` + receipts (`--include-trial-factors`) |
| 5 | LEAP: REQ detail acceptance, IMPL pseudo-code, CITDP persist; `tied_validate_consistency` |
| 6 | Build-plan verification evidence |

---

## Out of scope

- Discover `limit` / `pattern` changes for this slice
- Registry metric semantics or `validator_version` bumps
- Trimming Failed/skipped bullets
- Cohort JSONL / `runs.jsonl`
- Leaderboard or maturity language

---

## Risk

| Item | Consequence ladder |
| --- | --- |
| Dedupe hides earlier epochs | **Reversible** — manifest + `receipts/*.json` retain full basename |
| Missing wall time on old receipts | **Reversible** — re-snapshot with `--include-trial-factors` |
| Operator treats display label as unique key | **Reversible** — glossary states dedupe policy |

---

## Handoff

**Do next:** `@build-plan` for v2 cohort rules (v1 code already on disk).

**Disk:** [checklist-tracker.yaml](./checklist-tracker.yaml) · [test-strategy.md](./test-strategy.md) · [evidence/session-handoff.md](./evidence/session-handoff.md)
