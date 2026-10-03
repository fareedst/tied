# Phase 3 measurement report — scoped typed gate errors

**Request:** [REQ-PSEUDOCODE_TYPED_FLOW]  
**Date:** 2026-09-10  
**Status:** **Sponsor approved** — sub-phase **3d enabled** (2026-09-10)

## Executive recommendation

**Proceed** — sponsor approved default `typed_gate_errors` when `gate_mode && typed_flow`.

## Scope delivered

- `typed_gate_errors` defaults **effective true** when `gate_mode && typed_flow` (explicit `false` opts out)
- Severity promotion for proven violations on **annotated procedures only**
- Corpus expansion: fixtures **18–28** (11 new) with Phase 3 gate snapshot tests
- PSA-TYPED-001..004 checklist rows; grammar extension and vocabulary RECORD
- Qualification re-run via `run-phase3.ts`

## Test results

| Check | Result |
|-------|--------|
| mcp-server unit/integration | **651/651 pass** (+25 vs pilot 626) |
| F8 `typed_flow: false` regression | **PASS** (unit + qualification R1) |
| F12 recall (cases 01–05, 07, 18–21) | **100%** |
| Corpus fixtures | **28** labeled |
| F10 budget_exceeded (01–28) | **0** |

## Qualification (124-entry manifest)

Flags: `gate_mode: true`, `typed_flow: true`, `typed_gate_errors: true`

| Metric | Value |
|--------|-------|
| Parse ok | 124/124 |
| Gate pass (phase3) | 96/124 |
| R1 — `typed_flow: false` unchanged vs baseline | **124/124** |
| R2 — prose-only new gate failures | **0** |
| New gate failures vs pilot | **0** |
| New gate failures on annotated-only delta | **0** |

**Interpretation:** Phase 3 promotion did not introduce any new gate failures relative to the pilot warning-only sweep. The 28 pre-existing gate failures (unchanged from pilot) are legacy Layer C failures on specific Tier A/B sidecars, not typed-gate regressions.

## Corpus Phase 3 gate fixtures

| Case | Expectation under effective typed_gate_errors |
|------|-----------------------------------------------|
| 18, 20, 21, 27 | `ok: false` with promoted error codes |
| 19, 22–26, 28 | `ok: true` (prose-only guard / positive / policy unknowns) |

## Proof boundary

> gate_mode Phase 3: errors on proven typed violations in **annotated procedures only**; does not establish runtime truth, full path coverage, behavioral proof, or errors on legacy prose-only sidecars.

## Sponsor approval (sub-phase 3d)

| Item | Status |
|------|--------|
| Written sponsor approval | **Approved 2026-09-10** — proceed to default flip |
| `typed_gate_errors` default true when `gate_mode && typed_flow` | **Enabled** |
| CHANGELOG Deferred Phase 3 removal | **Done** |
| close_out gate | **ok** (`tf-phase3-closeout-20260910`) |

## Checklist gates (integrated depth)

| Gate | Run ID | Status |
|------|--------|--------|
| pre_implementation | `tf-phase3-pre-impl-20260910` | **ok** |
| verification | `tf-phase3-verify-20260910` | **ok** |
| close_out | `tf-phase3-closeout-20260910` | **ok** |

Adversarial inquiry artifacts: `working/REQ-PSEUDOCODE_TYPED_FLOW/adversarial-inquiry/phase-pre_implementation/`, `phase-verification/`. Re-run: `node working/REQ-PSEUDOCODE_TYPED_FLOW/run-phase3-gates.mjs`.
