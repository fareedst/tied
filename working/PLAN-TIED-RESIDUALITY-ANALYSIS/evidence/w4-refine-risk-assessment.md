# W4 refine-plan — Risk assessment

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**depth_tier:** integrated  
**gate_policy:** advisory  
**profile_depth:** integrated  
**Date:** 2026-09-27

## Eligibility

- Persistence / stateful-reliability and data-integrity-migration profiles match pilot REQs.
- W4 adds executable proof obligations — integrated depth mandatory; advisory until strict blocking demonstrated.

## Risks

| ID | Description | Likelihood | Impact | Mitigation |
|----|-------------|------------|--------|------------|
| RISK-RES-W4-001 | S-T03 execution mapping tested at wrong seam | Medium | High | Split composition faults; SD-W4-S-T03-EXEC |
| RISK-RES-W4-002 | P1 stressors pulled into W4 scope | Medium | Medium | Matrix tags; explicit P1 out-of-batch |
| RISK-RES-W4-003 | W3 blocks untested while legacy tests green | High | High | Dedicated w4 scaffolds; RED-before-GREEN mandate |
| RISK-RES-W4-004 | Holdouts run before primary matrix | Low | Medium | validation-stressors.md execution gate |
| RISK-RES-W4-005 | Composition tests claim race-freedom | Low | High | proof_boundary text; composition-coverage.md patterns only |

## Counterexamples (adversarial)

- Treating worksheet residue text as PASS without named test row.
- Skipping module validation between unit and composition layers.
- Using E2E UI for faults provable at composition level.

## Disposition

Proceed with refine-plan artifacts; build-plan W4 blocked until pre_implementation receipt `allowed: true` for W4 batch.
