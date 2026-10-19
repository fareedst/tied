# Risk assessment — Slice D Workflow D (refine pass 2)

**Date:** 2026-10-19  
**depth_tier:** integrated · **gate_policy:** advisory

## Consequence ladder

| Choice | Class | Note |
| --- | --- | --- |
| New `IMPL-TIED_EDPC_FAILURE_OPS` vs inline in PUBLISH | reversible | Separate module keeps publish builder size bounded |
| D-lite dogfood (no prod touch) | reversible | Proves validators; prod read_only dogfood is follow-on charter |
| Implement `production_touch` rules in code now | **costly if deferred** | R-EDPC-D-001 — Observed prod claims could slip through |
| Re-open v1 close_out vs v1.1 additive slice | reversible | Additive verification gate when code merges |
| Extend EDPC methodology doc §9 text | reversible | Plan aligns to existing §9; doc edit only if LEAP needed |

## Counterexamples

- Manifest or report states “healthy” because `npm test` passed (EDPC §9 exit gate)
- Health snapshot Observed rows cite production logs while charter has `production_touch: none`
- OFSM rows copied into `claims-ledger` without classification guardrails
- Route includes D but publish omits OFSM gaps
- `billing_processor_health` route drops C when incident implies behavioral bug

## Disposition

Proceed to **build-plan** after token mint, pseudo-code, and Slice D **pre_implementation** gate with fresh integrated inquiry. Do not claim Slice D complete until verification gate + dogfood D-lite evidence exist.
