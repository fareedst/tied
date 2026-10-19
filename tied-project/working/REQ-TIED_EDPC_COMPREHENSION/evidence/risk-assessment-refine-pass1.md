# Risk assessment — REQ-TIED_EDPC_COMPREHENSION (refine pass 1)

**Date:** 2026-10-19  
**depth_tier:** integrated · **gate_policy:** advisory

## Consequence ladder

| Choice | Class | Note |
| --- | --- | --- |
| Three-tier access model | reversible | Defaults + validator; sponsor can widen tier in charter |
| `edpc_full` supersedes `easar_full` naming | **costly** | Touches gate fixtures, docs, CASE dogfood references — alias period required |
| Integrated structural inquiry before Slice 1 RED | costly if skipped | Same pattern as EASAR slice 0 |
| v1 dogfood A+B+F only | reversible | D/E/G deferred with explicit non_goals |
| `production_touch` default `none` | reversible | Charter opt-in for read_only prod |

## Counterexamples (CITDP-aligned)

- Agent runs `npm test` on target while tier is `source_static`
- Publish manifest claims “healthy” from passing tests alone (EDPC §9 exit gate violation)
- Reflexion or adversarial ledger merged into `claims-ledger.v1.yaml`
- `easar_full` removed without alias → CASE/EASAR gate regressions
- SCM shell cites stale graph without freshness gap
- EDPC engagement mutates `tied-project/requirements.yaml` on target client via receipt builders

## Disposition

Proceed to build-plan after token mint + pseudo-code + `pre_implementation` gate allows. Block Slice 1 RED until pseudo-code gate passes.
