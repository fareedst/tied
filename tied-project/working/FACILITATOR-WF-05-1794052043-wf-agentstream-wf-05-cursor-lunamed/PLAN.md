# PLAN — Facilitator trial readout (PROMPT-WF-05 → Cursor agentstream / luna-med)

**Recorded:** 2026-11-07  
**Subject client:** `/Users/fareed/Documents/dev/test/1794052043-wf-agentstream-wf-05-cursor-lunamed`  
**Subject REQ (client only):** `REQ-CSV_ROW_OBJECT_MAPPING`  
**Store deliverable:** [trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md](../../../docs/demos/trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md)

Documentation-only work in the TIED store; no store `[REQ-*]` tokens; subject client read-only.

**Process log:** manifest **`exit_code: 1`**; inventory lists four turns **completed** with `close_out_gate_receipt`.

---

## Operator reproduction

```bash
source scripts/build-commands.sh
HARNESS=cursor MODEL_SLUG=gpt-5.6-luna-medium-fast MODEL_CONFIG=luna-med workflow_trial_agentstream wf-05
# → tag wf-agentstream-wf-05-cursor-lunamed → client 1794052043-wf-agentstream-wf-05-cursor-lunamed
```

Evidence: [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md).
