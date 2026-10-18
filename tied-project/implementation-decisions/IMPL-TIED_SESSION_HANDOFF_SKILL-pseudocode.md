# [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] — Bundled /handoff chat continuity skill.

Grammar-Version: v2

## Handoff skill bootstrap

procedure REGISTER_HANDOFF_IN_STANDALONE_MANIFEST:
  # [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] How: manifest skillName handoff storeDir tools/bundled-session-handoff-skill; installed via INSTALL_STANDALONE_SKILLS_COPY and LINKED_STUB.
  Contract:
    INPUT: { manifest.json }
    OUTPUT: { skill_name: handoff }
    PRE: tools/bundled-session-handoff-skill/SKILL.md exists
    POST: tied-install places .cursor/skills/handoff and .claude/skills/handoff
    DATA: client skills dirs
    EFFECTS: IO
  ASSERT manifest lists handoff
  RETURN skill_name

procedure HANDOFF_SKILL_PROCEDURE:
  # [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: strip /handoff; summarize session; emit completion signals; persist evidence/session-handoff.md when working folder known; deliver resume prompt; no git.
  Contract:
    INPUT: sponsor message with optional /handoff prefix
    OUTPUT: resume prompt block and optional session-handoff.md update
    PRE: disable-model-invocation skill
    POST: log path is session-handoff.md not handoff.md; legacy phrasing session handoff accepted
    EFFECTS: IO when writing evidence log
  STRIP /handoff prefix
  COLLECT plan tracker citdp scope read-only
  EMIT completion signals when TIED REQ applies
  IF working folder known THEN WRITE evidence/session-handoff.md
  RETURN fenced resume prompt
