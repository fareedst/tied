# PLAN — Facilitator trial readout (PROMPT-WF-01 → Cursor agentstream)

**Recorded:** 2026-11-07  
**Subject client:** `/Users/fareed/Documents/dev/test/1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast`  
**Subject REQ (client only):** `REQ-WF_TRIAL_SEMVER_SATISFACTION`  
**Store deliverable:** [trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md](../../../docs/demos/trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md)

Documentation-only work in the TIED store; no store `[REQ-*]` tokens; subject client read-only.

**Process log:** manifest **`exit_code: 1`** — turns 1–3 agent work on disk; turn 4 (`close-out`) not scheduled; harness abort during/after turn 3 boundary.

---

## Operator reproduction

```bash
source scripts/build-commands.sh
HARNESS=cursor MODEL_SLUG=gpt-5.6-luna-medium-fast MODEL_CONFIG=gpt-5.6-luna-medium-fast workflow-trial-agentstream wf-01
# → tag wf-agentstream-wf-01-cursor-gpt56lunamediumfast → client 1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast
```

Evidence: [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md).
