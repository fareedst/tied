# Test strategy — REQ-WF_TRIAL_COMPOSITION_PROMPTS

**Scope:** Store repo catalog + orchestrator docs/tests only (no disposable client pilots in build).

## Satisfaction criteria

| ID | Intent | Verification |
| --- | --- | --- |
| **SC-WF-ID-12** | `wf-09` accepted | `workflow_trial_agentstream wf-09 --dry-run` exit 0; four phases visible |
| **SC-WF-EXTRACT-09** | gawk extract works | Extracted remainder non-empty; contains “concurrent workers” (WF-09 signature phrase) |
| **SC-WF-REJECT-13** | Upper bound | `workflow_trial_agentstream wf-13` fails; message mentions WF id |
| **SC-CATALOG-09-12** | Catalog shape | Four `### PROMPT-WF-0[9]`…`12` sections; facilitator index rows; grading sub-check text |

## TDD order (build-plan)

1. RED — extend `workflow-trial-agentstream-sh.test.mjs` (wf-09 dry-run, wf-13 reject) before changing `normalize_wf_id`.
2. RED — optional `wf-trial-composition-prompts-contract.test.mjs` against catalog markdown.
3. GREEN — catalog + orchestrator + help.
4. Regression — full `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`.

## Commands

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs  # if added
```

## Out of scope

- Grading disposable agent runs for WF-09…12 (facilitator `@record-wf-trial` after live trials)
