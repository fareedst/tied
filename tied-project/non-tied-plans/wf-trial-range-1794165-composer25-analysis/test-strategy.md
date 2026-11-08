# Test strategy — wf-trial-range-1794165-composer25-analysis

Facilitator-only checks. No RED tests in the TIED store repo.

## Preconditions

- Five client roots exist under `/Users/fareed/Documents/dev/test/1794165*-wf-agentstream-wf-0*-cursor-composer25`.
- Gold readouts linked from [traditional-workflow-trial-runs-registry](../../../docs/demos/traditional-workflow-trial-runs-registry.md) remain unchanged.

## Required (@non-tied-build)

| ID | Check | Pass criteria |
| --- | --- | --- |
| T1 | Parse orchestrator manifests | Five `wf-trial-orchestrator-run.v1.json` files; exit codes match matrix in `PLAN.md` |
| T2 | Stderr turn crosswalk | `evidence/turn-matrix.md` lists each client: turn banners, `session_id` presence, WritableIterable line Y/N |
| T3 | Handoff vs stderr | WF-04 handoff says `@close-out`; WF-05 says `@build-plan`; matches incomplete stderr |
| T4 | WF-04 product spot-check | `cd 1794167373-... && npm test` → exit 0; capture stdout to `evidence/npm-test-wf04-rerun.txt` (optional if client removed) |
| T5 | Two-axis prose | `ANALYSIS.md` never claims model inability without citing gold readout contrast |

## Optional (sponsor)

| ID | Check | Notes |
| --- | --- | --- |
| O1 | Isolated `workflow_trial_agentstream wf-04` | New disposable client; compare stderr to batch |
| O2 | Isolated `workflow_trial_agentstream wf-05` | Same |
| O3 | `@record-wf-trial` | Registry update; separate skill |

## Security / safety

- Read-only on disposable clients except optional `npm test`.
- No credentials, no push, no MCP writes to project YAML.
