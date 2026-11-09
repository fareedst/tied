# Build-plan verification — REQ-WF_TRIAL_MODEL_SPEC_CLI

**date:** 2026-11-09

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Spot check

```bash
source scripts/build-commands.sh
workflow_trial_range cursor luna-low medium 2 2
# MODEL_CONFIG=luna-low MODEL_SLUG=gpt-5.6-luna-low-fast MODEL_EFFORT=medium
```

## Result

All tests pass (38 in workflow-trial-agentstream-sh suite + 7 spec resolver tests).
