# Phase handoff — refine-plan

**REQ:** REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS  
**Date:** 2026-11-11  
**plan_phase:** pre-implementation  

## RESOLVE summary

- Replace **WF-10–12** paste only; **WF-09** frozen.
- **WF-10:** mutually exclusive `--file` vs stdin; filesystem vs EOF contracts.
- **WF-11:** text source (file/stdin) + optional **JSON** ignore rules.
- **WF-12:** two **command families** + unknown command error; stdin payload.
- Forbid-list from GOAL_PROMPTS unchanged.

## Gates

- Adversarial inquiry: **not applicable** (minimal depth; catalog-only).
- pre_implementation: deferred to `@build-plan` after TIED indexes exist.

## Artifacts ready for build-plan

- [PLAN.md](../PLAN.md) §5–§9
- [test-strategy.md](../test-strategy.md)
- [CITDP-REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml](../CITDP-REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml)

## Do next

**`@build-plan`**
