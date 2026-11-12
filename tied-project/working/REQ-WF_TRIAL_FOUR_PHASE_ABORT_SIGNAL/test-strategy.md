# Test strategy — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

**profile_depth:** minimal · **gate_policy:** advisory  
**Waves:** 1 (shipped) · **1.5** (build-plan)

## Wave 1 — regression

Existing SC-WF-ABS-01..04 cases in [`workflow-trial-agentstream-sh.test.mjs`](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs) must stay green after wave 1.5.

## Wave 1.5 — bootstrap (`@build-plan` RED first)

| Case | Setup | Expected | SC |
| --- | --- | --- | --- |
| Gate skip no REQ | `WF_TRIAL_INCOMPLETE_REASON=claude_session_limit`, empty working | handoff skip DIAGNOSTIC; no product REQ ERROR | SC-WF-ABS-05 |
| Proof skip | same enum | proof manifest skip DIAGNOSTIC | SC-WF-ABS-05 |
| Post-classifier order | fixture stdout tail + `wf_trial_abort_signal_apply_workspace` | ERROR headline before incomplete_reason DIAGNOSTIC; provider substring | SC-WF-ABS-06 |
| Preflight block | temp validation JSON smoke detail session limit + handler | exit block; no “continuing may weaken MCP parity” | SC-WF-ABS-07 |
| Preflight advisory other | failed validation, non-limit detail | continues unless STRICT | SC-WF-ABS-07 neg |

## Wave 1.5 — agentstream unit

| Case | Expected | SC |
| --- | --- | --- |
| `detectClaudeSessionLimitLine` | matches provider message; rejects unrelated | SC-WF-ABS-08 |
| Highlight idempotence | second call same run no duplicate ERROR headline | SC-WF-ABS-08 |

## Commands

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npm test
```
