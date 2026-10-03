# W3 refine-plan — risk assessment (integrated depth)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Behavior-changing CITDP:** `CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml`  
**Batch:** W3 stack elevation refine/plan only (no project YAML mutation)  
**Date:** 2026-09-27

## depth_tier selection

- **Selected:** `integrated`
- **gate_policy:** `advisory`
- **prior_depth_tier:** `integrated` (W2 classification complete)
- **Assurance profiles:** `stateful-reliability`, `data-integrity-migration`, plus `performance-scale-cost` for deferred P1 rows (S-T11, S-T16)
- **Eligibility triggers matched:** behavior-changing LEAP on persistence-heavy pilot REQs

## Integrated waiver

Not used.

## Primary falsification surfaces (W3 refine planning)

1. Proposed working diff applied to `tied/` without sponsor SD-W3-ROW-SET / build-plan gate.
2. Harmful residue (S-T12) written as positive REQ satisfaction criterion.
3. Full 14-row promotion without trim — scope exceeds bounded pilot module validation.
4. Stressor worksheet text pasted as duplicate REQ body instead of facet metadata.
5. S-T03 elevated while gap-list still marks execution-path mapping **ambiguous**.

## Residual risks (W3 refine batch)

- **RISK-RES-W3-001** — Sponsor approves all 14 rows at once — mitigated: default P0=7, P1 defer=7.
- **RISK-RES-W3-002** — S-T10 layer ambiguity — mitigated: P1 defer + SD-W3-S-T10 placeholder.
- **RISK-RES-W3-003** — harmful→positive REQ — mitigated: S-T12 typed architecture_constraint; explicit non-goals in CITDP.

## Adversarial inquiry

Structural `pre_implementation` pass at integrated depth with `gate_policy: advisory`; scope `PLAN-TIED-RESIDUALITY-ANALYSIS#W3-LEAP-BOUNDARY#refine20260927`; run_id `refine-plan-w3-pre-impl-2026-09-27`; artifacts under `working/REQ-FEAT_TASK_EXECUTION_RECOVERY/adversarial-inquiry/phase-pre_implementation/`.
