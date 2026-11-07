# IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF — essence pseudocode

<!-- [IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF] [ARCH-TIED_PROMPT_SKILL_DISK_HANDOFF] [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] — disk gate for plan execution steps -->

```
PROCEDURE ENFORCE_DISK_PLAN_HANDOFF
  # [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] [ARCH-TIED_PROMPT_SKILL_DISK_HANDOFF] [IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF]
  # PRE: prompt_type in PLAN_LEAVES or BUILD_CLOSE
  # POST: session-handoff Plan execution steps reflects PLAN step changes
  # EFFECTS: durable step ledger on disk
  IF plan_steps_changed AND NOT handoff_plan_steps_updated THEN
    REFUSE stop WITH reason "chat-only handoff"
  ENDIF
  EMIT parent_handoff WITH paths_only
END PROCEDURE
```
