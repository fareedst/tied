# [IMPL-TIED_CLEAR_WORKSPACE_SKILL] [ARCH-TIED_CLEAR_WORKSPACE_SKILL_BOUNDARY] [REQ-TIED_CLEAR_WORKSPACE_SKILL] — Bundled /clear-workspace orchestrator.

Grammar-Version: v2

## Clear-workspace skill bootstrap

procedure REGISTER_CLEAR_WORKSPACE_IN_STANDALONE_MANIFEST:
  # [IMPL-TIED_CLEAR_WORKSPACE_SKILL] [ARCH-TIED_CLEAR_WORKSPACE_SKILL_BOUNDARY] [REQ-TIED_CLEAR_WORKSPACE_SKILL] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] How: manifest skillName clear-workspace storeDir tools/bundled-clear-workspace-skill.
  Contract:
    INPUT: { manifest.json }
    OUTPUT: { skill_name: clear-workspace }
    PRE: bundled-clear-workspace-skill/SKILL.md exists
    POST: install parity with other standalone skills
    EFFECTS: IO
  ASSERT manifest lists clear-workspace
  RETURN skill_name

procedure CLEAR_WORKSPACE_ROUTE:
  # [IMPL-TIED_CLEAR_WORKSPACE_SKILL] [ARCH-TIED_CLEAR_WORKSPACE_SKILL_BOUNDARY] [REQ-TIED_CLEAR_WORKSPACE_SKILL] [REQ-TIED_GIT_HYGIENE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: resolve REQ scope; delegate plan-close-out when incomplete; tied_git_hygiene preview; traceable-commit prep when gates green; suggest handoff when not commit-ready; no unprompted commit.
  Contract:
    INPUT: sponsor context with optional /clear-workspace prefix
    OUTPUT: hygiene receipt paths and next-step list
    PRE: routing doc clear-workspace-routing.md
    POST: commit only when sponsor explicitly requests
    EFFECTS: IO | MCP read
  STRIP /clear-workspace prefix
  RESOLVE working folder tracker citdp
  IF close_out incomplete THEN RUN plan_close_out workflow
  CALL tied_git_hygiene preview plan_close_out context
  IF commit ready THEN PREP traceable_commit checklist steps
  ELSE SUGGEST handoff
  RETURN summary
