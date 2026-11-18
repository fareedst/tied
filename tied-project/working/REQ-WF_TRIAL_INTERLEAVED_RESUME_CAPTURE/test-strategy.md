# Test strategy — REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** `scripts/lib/wf-trial-interleaved-four-phase.inc.sh`, `tools/bootstrap/lib/wf-trial-tracker-shape.mjs`

## RED → GREEN (`@build-plan`)

| Case | Setup | Expected | SC |
| --- | --- | --- | --- |
| stderr-only stub | mock agentstream prints `session_id=` to stderr | 4 invokes, resume argv on orders 2–4 | SC-WF-IRC-01 |
| Incident fixture | [fixture-process-stderr-1794973656-excerpt.log](./evidence/fixture-process-stderr-1794973656-excerpt.log) | uuid extracted | SC-WF-IRC-02 |
| Regression | full `workflow-trial-agentstream-sh.test.mjs` | all pass including SC-WF-IST | SC-WF-IRC-03 |
| stdout-first | session on stdout only | stdout wins over stderr | SC-WF-IRC-02 |

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-tracker-shape.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```