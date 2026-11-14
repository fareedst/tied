# Build-plan verification — REQ-WF_TRIAL_MATRIX_CLAUDE_EFFORT_TIERS

**Date:** 2026-11-14  
**prompt_type:** build-plan

## Commands

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
  → 25 pass (SC-WF-CMX-11 count 13; SC-WF-CMX-22…26)

node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
  → spot checks OK (WF-09/10 Claude @high and Sonnet low)

node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs
  → OK: comparison matrix written (157 master rows)

node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
  → exit 0
```

## Registry matrix (sample)

- Header includes `Claude · claude-sonnet-5-5 effort=high` and `effort=medium`
- WF-10: Sonnet **1794411691** under `@high`; Haiku **1794409094** under Haiku `@high`
- WF-09: Sonnet **1794586024** low; **1794353174** `@high`

## Modules touched

- `tools/bootstrap/lib/wf-trial-comparison-matrix.mjs`
- `tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs`
- `tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs`
- `docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md`
- `tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md`
- `tied-project/CHANGELOG.md`