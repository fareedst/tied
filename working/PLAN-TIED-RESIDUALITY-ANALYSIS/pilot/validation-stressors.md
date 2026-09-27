# Validation stressor set (holdout scaffold)

**Candidate only — not canonical until W5 promotion gate.**

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Sponsor choice (W1):** Holdout validation stressors are authored in **W4 only**, distinct from the 25 design stressors in `pilot/stressor-catalog.md` and worksheets.

**Sponsor choice (W4, 2026-09-27):** Run holdouts **in parallel** with the main test matrix (not strictly after all primary tests are green).

## Purpose

Holdout scenarios exercise the **elevated stack + tests** under unfamiliar conditions not used to drive W1 worksheets or W3 LEAP row selection. Results attach as pilot DoD item 9 evidence with explicit **overlap disclosure** where a holdout resembles a design stressor.

## Overlap disclosure

| Holdout ID | Related design stressor | Overlap note |
|------------|-------------------------|--------------|
| V-H01 | S-T11 (retry storm) | Holdout uses **sustained duplicate create** storm, not worksheet wording for backpressure ARCH |
| V-H02 | S-T16 (stale reads) | Holdout uses **read-after-write lag** probe; P1 S-T16 not in W4 batch 1 |
| V-H03 | S-T09 (schema skew) | Holdout uses **manifest field unknown to reader**; P1 defer for stack elevation |

## Holdout scenarios (scaffold — not executed in refine-plan)

### V-H01 — Sustained duplicate create storm

- **Category:** technical / performance-scale-cost
- **Application:** After primary W4 matrix GREEN, run concurrent `createIdempotently` with identical keys at high fan-out (in-process, bounded).
- **Desirable residue:** Single feature identity; callers receive same reference; no unbounded lock wait.
- **Proof boundary:** In-process composition/load harness only; not production capacity proof.
- **tied_refs:** REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE, ARCH-FEAT_IDEMPOTENT_CREATION

### V-H02 — Read-after-write visibility lag

- **Category:** technical / stateful-reliability
- **Application:** Mutate execution state or feature manifest, then read from a secondary reader fake with configurable lag.
- **Desirable residue:** Documented consistency model or bounded stale read; no silent success on stale dependency unlock.
- **Proof boundary:** Fake reader injection; not partition tolerance proof.
- **tied_refs:** REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE

### V-H03 — Unknown manifest field tolerated at read boundary

- **Category:** technical / data-integrity-migration
- **Application:** Publish manifest with forward-compatible unknown field; older reader path must fail closed or ignore per ARCH policy.
- **Desirable residue:** Deterministic error or safe ignore — no silent corruption.
- **Proof boundary:** Module reader test; full rollout safety deferred with P1 S-T09.
- **tied_refs:** REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_STORE_PERSISTENCE (read seam)

## Execution gate

Run holdouts **after** `w4-test-strategy.md` primary matrix reaches composition GREEN. Record outcomes in working evidence (pass/fail/N/A with rationale). N/A requires sponsor-visible rationale per feature plan §7 item 9.

## Status (build-plan W4)

V-H01..V-H03 executed in `w4-residuality-pilot.composition.test.ts` (parallel batch). Overlap disclosure table unchanged.
