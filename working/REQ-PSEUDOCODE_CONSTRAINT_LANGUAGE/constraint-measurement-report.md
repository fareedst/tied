# Constraint-language measurement report — scoped constraint gate errors

**Request:** [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]  
**Date:** 2026-09-10  
**Status:** **Sponsor approved** — sub-phase **3d enabled** (2026-09-10)

## Executive recommendation

**Proceed** — F11 pass (median 5 lines / 5 decisions), qualification R1 124/124 and R2 0 prose-only failures, corpus F1–F12 + CL-* green, FP cap ≤5%. Sponsor approved default `constraint_gate_errors` when `gate_mode && typed_flow && constraint_flow`.

## Scope delivered

- Grammar v2 opt-in via `Grammar-Version: v2` header; v1 + typed-flow extension unchanged
- `constraint_flow` composes after typed-flow; `sections.constraint_language` on report v1
- Interprocedural summaries, refinement predicates, alias/mutation policy, fixed-point solver with budget disclosure
- 40 constraint fixtures + 6 typed-flow reuse entries (46 labeled corpus entries)
- PSA-CONSTRAINT-001..004 checklist rows
- Qualification harness extended (baseline, pilot, phase-gate sweeps)
- `constraint_gate_errors` defaults **effective true** when `gate_mode && typed_flow && constraint_flow` (explicit `false` opts out) — sub-phase 3d

## Test results

| Check | Result |
|-------|--------|
| mcp-server unit/integration | **739/740 pass** (1 pre-existing `citdp-writer.test.js` unrelated) |
| F8 `constraint_flow: false` regression | **PASS** (unit + qualification R1) |
| F12 recall (definite-error labeled cases) | **100%** |
| Corpus fixtures | **40** constraint + **6** typed-flow reuse = **46** labeled |
| F10 solver_truncation (non-budget-probe at defaults) | **0** |
| FP cap (positive controls) | **0%** (0/18 false gating errors) |

## Synthetic corpus (F1–F12 + CL-*)

| Factor | Criterion | Result |
|--------|-----------|--------|
| F1 | All fixtures parse | **PASS** (46/46) |
| F1b | Mixed v2/v1 constructs retained | **PASS** (cl-06) |
| F8 | Legacy with `constraint_flow: false` | **PASS** vs typed-flow Phase 3 path |
| F9 | Deterministic report serialization | **PASS** |
| F10 | Zero `solver_truncation` at default budgets | **PASS** (cl-15 budget-probe excluded) |
| F11 | Authoring burden gate | **PASS** (see below) |
| F12 | Recall definite-error cases | **100%** |
| FP cap | False gating errors on positive controls | **0%** (≤5% threshold) |
| CL-1 | Case 12 refinement provable when authored | **PASS** (cl-07/cl-08) |
| CL-2 | Case 8 mutation error when policy declared | **PASS** (cl-17) |
| CL-3 | Case 11 unknown without alias policy | **PASS** (cl-20) |
| CL-4 | Interproc without summary → unknown | **PASS** (cl-14) |
| CL-5 | Solver truncation disclosed | **PASS** (cl-15) |
| CL-6 | v1 sidecars without v2 header → zero constraint diagnostics | **PASS** (cl-05, cl-21, cl-40, typed-flow reuse) |

Corpus root: `mcp-server/src/analysis/fixtures/constraint-language/`

### Precision / recall / unknown-rate (46-entry labeled corpus)

| Metric | Value | Notes |
|--------|-------|-------|
| Recall (definite-error labeled) | **100%** (6/6 non-gate-scoping cases) | cl-08, cl-16, cl-17, cl-19 + gate-scoping cl-23 |
| Precision (positive controls) | **100%** | 0 false gating errors on 18 positive controls |
| Unknown disclosure (policy cases) | **100%** | cl-12, cl-14, cl-20, tf-09, tf-10 require ≥1 unknown with cause |
| Solver truncation rate (corpus) | **1/40** | cl-15 budget-probe only; disclosed in metadata |

## Qualification (124-entry manifest)

Source: `working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/qualification/metrics/compare-constraint-summary.json`

Flags (phase-gate sweep): `gate_mode: true`, `typed_flow: true`, `constraint_flow: true`, `constraint_gate_errors: true`

| Metric | Value |
|--------|-------|
| Compared entries | 124/124 |
| R1 — `constraint_flow: false` unchanged vs Phase 3 baseline | **124/124** |
| R2 — prose-only new gate failures | **0** |
| R3 — annotated-only new failures | **0** |
| R4 — Tier A unintended failures | **0** |
| R5 — snapshot drift | **1** expected (`tier-b-stdd-IMPL-PROMPT_TYPE_GLOBAL_SKILLS` — constraint section additive) |
| R6 — determinism | **PASS** |

**Sub-phase 3b (phase-gate sweep):** Re-run with `constraint_gate_errors: true` — **0 new gate failures** vs Phase 3 baseline; legacy Layer C failures unchanged (28 pre-existing on specific Tier A/B sidecars).

## F11 authoring burden study

Source: `working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/qualification/metrics/annotation-overhead-constraint.yaml`  
Study copies: `working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/annotation-study/` (read-only sources under `/Users/fareed/Documents/dev/test` — not mutated)

| Metric | Threshold | Result |
|--------|-----------|--------|
| Procedures studied | 5–8 | **6** |
| Median annotation lines / procedure | ≤15 (stop >15) | **5.0** |
| Median authoring decisions / procedure | ≤25 | **5.0** |
| SP-1..SP-7 semantic preservation | any fail → REVISE | **6/6 PASS** |

| Study ID | Procedure | Lines | Decisions |
|----------|-----------|-------|-----------|
| volumestats-run | RUN_VOLUMESTATS | 4 | 4 |
| netif-run | RUN | 5 | 5 |
| rootjobs-parse-flags | PARSE_FLAGS | 5 | 5 |
| volumestats-discover | LIST_DARWIN_VOLUMES | 4 | 4 |
| rootjobs-invoke-collector | INVOKE_COLLECTOR | 7 | 7 |
| volumestats-report | WRITE_TABLE | 6 | 6 |

## Solver budget statistics

| Knob | Default | Corpus at defaults |
|------|---------|-------------------|
| max_solver_steps | 256 | 0 truncation (39/39 non-probe fixtures) |
| max_summary_depth | 8 | within budget |
| max_predicate_nodes | 512 | within budget |
| Budget-probe fixture cl-15 | capped steps=0 | truncation disclosed (`solver_truncation: true`) |

## Proof boundary

> gate_mode constraint-language: errors on proven constraint violations in **constraint-annotated procedures only**; does not establish runtime truth, full path coverage, behavioral proof, or errors on legacy prose-only / v1-only sidecars. Solver truncation and unsupported predicates remain unknowns unless proven violation on annotated procedure.

## Sponsor approval (sub-phase 3c / 3d)

| Item | Status |
|------|--------|
| F11 pass (median ≤15 lines, ≤25 decisions, SP-1..SP-7) | **PASS** |
| FP cap ≤5% on positive controls | **PASS** (0%) |
| Qualification R1/R2 hard stops | **PASS** |
| Written sponsor approval for 3d default flip | **Approved 2026-09-10** — proceed |
| `constraint_gate_errors` default true when `gate_mode && typed_flow && constraint_flow` | **Enabled** (sub-phase 3d) |

## Checklist gates (integrated depth)

| Gate | Run ID | Status |
|------|--------|--------|
| pre_implementation | `cl-pre-impl-20260910` | **ok** |
| verification | `cl-verify-20260910` | **ok** |
| close_out | `cl-closeout-20260910` | **ok** |

Adversarial inquiry artifacts: `working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/adversarial-inquiry/phase-pre_implementation/`, `phase-verification/`. Re-run: `node working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/run-close-out-gates.mjs`.
