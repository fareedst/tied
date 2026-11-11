# Test strategy — REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP

**Phase:** refine-plan (design only; no RED files yet).

## TDD order (build-plan)

1. Confirm IMPL pseudo-code passes `pseudocode_validate`
2. **RED** — extend `workflow-trial-agentstream-sh.test.mjs`
3. **GREEN** — `wf-trial-agentstream-help.inc.sh` + orchestrator early dispatch
4. Vocab RECORD + `tied_validate_consistency`

## Unit / composition (CI — required)

| Case | Location | Pass threshold |
| --- | --- | --- |
| `--help` exit 0 | `workflow-trial-agentstream-sh.test.mjs` | Existing test updated if output shape changes (section markers) |
| Empty argv exit 0 | Same | `status === 0`; stderr matches title; stdout empty |
| Empty argv no gawk | Same | `PATH` minimal; help still succeeds |
| Help without store root | Same | `cd` outside repo or `REPO_ROOT` invalid + help-only argv (if script allows cwd anywhere) |
| Plain mode | Same | `NO_COLOR=1` → no ANSI; ASCII hr optional assert |
| Stdout override | Same | `TIED_CLI_HELP_STDOUT=1` or argv `--stdout` → content on stdout, stderr empty |
| Invalid WF id unchanged | Same | Still fails when WF_ID provided (regression) |
| Delegated alias | Optional bash one-liner | `source build-commands.sh && workflow_trial_agentstream --help` exit 0 |

## Out of scope

- Live disposable bootstrap for help
- `build-commands-how.test.mjs` changes (unless shared inc extracted later)

## Verification manifest (build-plan)

```text
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
