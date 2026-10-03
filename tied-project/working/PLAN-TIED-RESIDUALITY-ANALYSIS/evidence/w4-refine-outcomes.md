# W4 refine-plan — Refine outcomes (Touchpoint 1 — RECORD)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W4 executable test strategy — refine/plan only (no production GREEN)  
**Date:** 2026-09-27

## W3 entry (met)

- P0 LEAP persisted; `pseudocode_validate` + `tied_validate_consistency` ok.
- Handoff: `evidence/w3-exit-w4-handoff.md`, `evidence/w3-build-plan-summary.md`.

## Resolved terms (W4 batch)

- **test strategy matrix** — `pilot/w4-test-strategy.md` rows: stressor_id | test_layer | fault_pattern | tied_refs | proof_boundary.
- **holdout validation stressor** — `pilot/validation-stressors.md` (W4-only scaffold per W1 sponsor); distinct from design catalog with overlap disclosure.
- **S-T03 split** — Create path: `PUBLISH_FAILED` on store IO; execution path: `STORE_WRITE_FAILED` / `STORE_UNAVAILABLE` on evidence append via injectable persistence seam; LEAP to REQ only if RED shows silent success (**SD-W4-S-T03-EXEC** resolved: tests first).
- **finding confirmation** — W2 `finding` rows map to unit/composition tests without stack elevation unless LEAP triggered by failing RED.

## Deliverables produced (refine-plan W4)

1. Linked plan: `w4-refine-*` todos marked complete; `w4-build-plan-tests` pending.
2. `CITDP-RESIDUALITY-PILOT-W4-TESTS.yaml` — behavior-changing test batch CITDP (separate from W3 LEAP record).
3. `pilot/w4-test-strategy.md` — matrix + PROC-TIED_DEV_CYCLE ordering + S-T03 clarification.
4. `pilot/validation-stressors.md` — holdout scaffold V-H01..V-H03.
5. Test scaffolds: `w4-residuality-pilot.unit.test.scaffold.ts`, `w4-residuality-pilot.composition.test.scaffold.ts`.
6. Tracker `w4_refine_batch` section in `agent-req-implementation-checklist.yaml`.
7. `gate-tracker-pre-implementation-w4.yaml` + pre_implementation receipt (after gate validate).
8. This file + `w4-refine-risk-assessment.md` + `sub-adversarial-inquiry-pass-w4-refine.md`.

## Vocabulary RECORD/VALIDATE

- **RECORD:** W4 test-layer and holdout terms in `pilot/w4-test-strategy.md` and `validation-stressors.md`; no new semantic tokens.
- **PRELOAD:** `residuality.md`, `quality-assurance.md`, `fidelity-research.md`.
- **VALIDATE:** Deferred to traceable-commit after build-plan W4 test implementation.

## Sponsor decisions (resolved 2026-09-27)

| ID | Sponsor choice |
|----|----------------|
| SD-W4-S-T03-EXEC | **Tests first** — failing tests + code; add requirement text only if a test proves a gap |
| SD-W4-BATCH-SPLIT | **Full matrix** — implement entire `w4-test-strategy.md` in one build-plan W4 push (largest scope) |
| SD-W4-HOLDOUTS | **Holdouts in parallel** with main tests (V-H01..V-H03 not strictly after all primary greens) |
| SD-W4-FINDINGS | **Full** — automated confirmation for all 10 W2 `finding` rows in the strategy doc |

## Recommended build-plan W4 scope (post-sponsor)

**Full matrix + parallel holdouts:** Unit and composition coverage for P0 facets, all 10 `finding` rows, **S-T03** split legs, and holdout scenarios V-H01..V-H03 per sponsor scope. LEAP on REQ only when RED confirms gap (especially S-T03 execution path). Still follow inner TDD order per test/file even when holdouts run in parallel at batch level.

## Recommended next step

**build-plan W4** (`w4-build-plan-tests`) — promote scaffolds to RED tests, implement GREEN in production modules per pseudo-code, run composition faults, optional holdouts, verification gate, `tied_validate_consistency` if LEAP.
