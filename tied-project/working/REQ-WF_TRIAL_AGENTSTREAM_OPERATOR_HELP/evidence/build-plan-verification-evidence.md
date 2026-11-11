# Build-plan verification — REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP

**date:** 2026-11-09

## Command

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

**Result:** 27/27 pass

## Touchpoints

| File | Change |
| --- | --- |
| `scripts/lib/wf-trial-agentstream-help.inc.sh` | Styled help + help-only argv detection |
| `scripts/workflow-trial-agentstream.sh` | Early dispatch before REPO_ROOT |
| `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | Operator help cases |
| `tied-project/vocab/agentstream.md` | Glossary row |

## Manual spot-check

```bash
source scripts/build-commands.sh
workflow_trial_agentstream
workflow_trial_agentstream --help
```
