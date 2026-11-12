# Test strategy — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

**profile_depth:** minimal · **gate_policy:** advisory  
**Tracker slugs (build):** `unit-test-red` → `unit-test-green` → `composition-integration` → `verification-gate`

## Unit — abort classifier (`@build-plan` RED first)

Add cases to [`workflow-trial-agentstream-sh.test.mjs`](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs). Source `wf-trial-abort-signal.inc.sh` in bash subshells with temp log files.

| Case | Fixture | Expected | SC |
| --- | --- | --- | --- |
| Incident 1794504138 | Copy [`evidence/fixture-1794504138-process.stderr.log`](./evidence/fixture-1794504138-process.stderr.log) + stdout tail into tmp | `wf_trial_classify_incomplete_reason` prints `claude_session_limit`; turn 3 | SC-WF-ABS-01 |
| Missing session 2 | Synthetic stderr: turn 1 id, turn 2 banner only | `turn_missing_session_id`; turn 2 | SC-WF-ABS-02 |
| Happy complete stderr | Four turns each with `session_id=` | empty or `unknown` only when gate would pass | SC-WF-ABS-03 prep |
| Gate ordering | Stub workspace + classifier env + missing build handoff | stderr line order: incomplete_reason DIAGNOSTIC before handoff ERROR | SC-WF-ABS-04 |

## Manifest merge

| Case | Action | Expected |
| --- | --- | --- |
| Merge reason | Call `wf_trial_process_log_set_incomplete_reason` on temp manifest JSON | `incomplete_reason` + `incomplete_turn` present after finalize |

## Regression

Run full `workflow-trial-agentstream-sh.test.mjs` — all SC-WF-PHG-* pass unchanged.

## Commands

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
