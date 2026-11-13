# Refine-plan evidence — REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW

**date:** 2026-11-12  
**prompt_type:** refine-plan

## Locked sponsor resolutions (pass 2)

- Minimal GREEN disposable product (`meteringCanaryLabel`, one test)
- `workflow_trial_agentstream wf-meter-01` in M1
- Separate metering catalog (**D-CATALOG-SPLIT**)
- Budgets: ≤45 LOC, ≤2 tests, wall-clock target 8–15 min (documented)
- Gawk exit delimiter **D-EXTRACT-GAWK**: `^### PROMPT-`

## Artifacts written

- `PLAN.md`, `test-strategy.md`, `CITDP-*.yaml`, `checklist-tracker.yaml`
- `evidence/session-handoff.md`
- Draft `docs/demos/harness-eval/suites/metering-canary-suite-v1.yaml`
- Draft `docs/demos/catalog-harness-metering-lite-workflow.md` (skeleton for build-plan expansion)

## Not done

- REQ/ARCH/IMPL YAML, orchestrator code, bootstrap tests, commits
