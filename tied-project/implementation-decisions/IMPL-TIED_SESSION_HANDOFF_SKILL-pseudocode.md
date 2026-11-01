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

procedure HANDOFF_MERGE_PRIOR:
  # [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] How: read rolling session-handoff.md and sibling *handoff* snapshots; merge pending_prior_requests by id; append dated subsections without deleting history.
  Contract:
    INPUT: { working_token, evidence_dir }
    OUTPUT: { merged_pending_rows, plan_spine_facts }
    PRE: structure doc session-handoff-structure.md available to agent
    POST: DAE handoffs/{phase}.yaml not treated as substitute for session-handoff.md
    DATA: evidence/session-handoff.md, evidence/*handoff*.md
    EFFECTS: read-only until persist step
  READ evidence/session-handoff.md IF exists
  READ evidence/*handoff*.md AND sibling snapshots newest-first
  MERGE pending_prior_requests BY id
  RETURN merged_pending_rows plan_spine_facts

procedure HANDOFF_PERSIST_STRUCTURE:
  # [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] How: write session-handoff.md using normative section order; advisory WARN on missing required sections; optional session-handoff-context.v1 copy-paste only.
  Contract:
    INPUT: { draft_sections, thread_class }
    OUTPUT: { session_handoff_path }
    PRE: HANDOFF_MERGE_PRIOR completed when working folder known
    POST: filename session-handoff.md not handoff.md; section order matches structure doc
    DATA: tied-project/working/{token}/evidence/session-handoff.md
    EFFECTS: IO
  ADVISORY_VALIDATE sections AGAINST structure doc
  IF missing required section THEN WARN sponsor CONTINUE
  WRITE evidence/session-handoff.md
  RETURN session_handoff_path

procedure HANDOFF_SKILL_PROCEDURE:
  # [IMPL-TIED_SESSION_HANDOFF_SKILL] [ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY] [REQ-TIED_SESSION_HANDOFF_SKILL] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: strip /handoff; merge prior handoffs; emit completion signals; persist structured session-handoff.md; resume prompt includes Environment and Pending prior requests; no git.
  Contract:
    INPUT: sponsor message with optional /handoff prefix
    OUTPUT: resume prompt block and optional session-handoff.md update
    PRE: disable-model-invocation skill
    POST: log path is session-handoff.md not handoff.md; legacy phrasing session handoff accepted
    EFFECTS: IO when writing evidence log
  STRIP /handoff prefix
  COLLECT plan tracker citdp scope read-only
  CALL HANDOFF_MERGE_PRIOR when working folder known
  EMIT completion signals when TIED REQ applies
  IF working folder known THEN CALL HANDOFF_PERSIST_STRUCTURE
  RETURN fenced resume prompt with Environment and Pending prior requests sections
