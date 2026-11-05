# PLAN — Facilitator trial readout (PROMPT-WF-04 → Cursor agentstream)

**Recorded:** 2026-11-04  
**Subject client:** `/Users/fareed/Documents/dev/test/1793851888-wf-agentstream-wf-04-cursor-composer25`  
**Subject REQ (client only):** `REQ-FIXTURE_REQ_MARKER_AUDIT`  
**Store deliverable:** [trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md](../../../docs/demos/trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)

Documentation-only work in the TIED store; no store `[REQ-*]` tokens; subject client read-only.

**Process log:** `tied-project/working/wf-trial-orchestrator-run/evidence/`; manifest `exit_code: 0`, ~11.5 min wall.

---

## Operator reproduction

```bash
source scripts/build-commands.sh
HARNESS=cursor MODEL_SLUG=composer-2.5-fast MODEL_CONFIG=composer-2.5 workflow-trial-agentstream wf-04
# → tag wf-agentstream-wf-04-cursor-composer25 → client 1793851888-wf-agentstream-wf-04-cursor-composer25
```

Evidence: [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md).
