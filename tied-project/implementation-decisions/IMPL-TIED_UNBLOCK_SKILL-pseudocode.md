# [IMPL-TIED_UNBLOCK_SKILL] [ARCH-TIED_UNBLOCK_SKILL_BOUNDARY] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] — Bundled /unblock sponsor decision skill.

Grammar-Version: v2

## Unblock skill bootstrap

procedure REGISTER_UNBLOCK_IN_STANDALONE_MANIFEST:
  # [IMPL-TIED_UNBLOCK_SKILL] [ARCH-TIED_UNBLOCK_SKILL_BOUNDARY] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] How: manifest entry skillName unblock storeDir tools/bundled-unblock-skill; installed via INSTALL_STANDALONE_SKILLS_COPY and LINKED_STUB.
  Contract:
    INPUT: { manifest.json }
    OUTPUT: { skill_name: unblock }
    PRE: tools/bundled-unblock-skill/SKILL.md exists
    POST: tied-install places .cursor/skills/unblock and .claude/skills/unblock
    DATA: client skills dirs
    EFFECTS: IO
  ASSERT manifest lists unblock
  RETURN skill_name

procedure UNBLOCK_SKILL_PROCEDURE:
  # [IMPL-TIED_UNBLOCK_SKILL] [ARCH-TIED_UNBLOCK_SKILL_BOUNDARY] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_SPONSOR_QUESTIONS] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] How: agent strips /unblock; collects flagged costly choices; orders for path clearance; records sponsor answers; optional tied_sponsor_questions read-only seed.
  Contract:
    INPUT: sponsor message with optional /unblock prefix
    OUTPUT: recorded sponsor decisions and unblocked next steps
    PRE: disable-model-invocation skill
    POST: no invented costly choices; avoid over-asking on reversible defaults
    EFFECTS: pure | IO when recording plan evidence
  STRIP /unblock prefix
  COLLECT already-flagged blockers only
  ORDER for maximum path to completion
  EMIT plain options and completion-biased defaults
  RECORD answers to plan or evidence paths
  RETURN handoff
