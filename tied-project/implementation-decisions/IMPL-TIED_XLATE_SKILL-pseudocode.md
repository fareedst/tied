# [IMPL-TIED_XLATE_SKILL] [ARCH-TIED_XLATE_SKILL_BOUNDARY] [REQ-TIED_XLATE_SKILL] — Bundled /xlate Touchpoint 1 skill install.

Grammar-Version: v2

## Xlate skill bootstrap

procedure INSTALL_XLATE_SKILL:
  # [IMPL-TIED_XLATE_SKILL] [ARCH-TIED_XLATE_SKILL_BOUNDARY] [REQ-TIED_XLATE_SKILL] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] How: copy tools/bundled-xlate-skill to .cursor/skills/xlate in full mode; linked stub in linked mode.
  Contract:
    INPUT: project_root, install_mode full | linked
    OUTPUT: { dest: string }
    PRE: canonical SKILL.md exists under tools/bundled-xlate-skill
    POST: installed skill documents /xlate, routing.md, RESOLVE charter
    DATA: client .cursor/skills/xlate tree
    DATA_TRANSITION: absent or stub skill to installed SKILL.md tree
    EFFECTS: IO
  IF full THEN copyTree bundled-xlate-skill
  ELSE write linked stub pointing at store SKILL.md
  RETURN dest path

procedure XLATE_SKILL_PROCEDURE:
  # [IMPL-TIED_XLATE_SKILL] [ARCH-TIED_XLATE_SKILL_BOUNDARY] [REQ-TIED_XLATE_SKILL] [REQ-VOCABULARY_EXPLORER] How: agent strips /xlate prefix; PRELOAD routing glossaries; RESOLVE table; RECORD; optional tied_vocabulary_explorer_run.
  Contract:
    INPUT: sponsor message with optional /xlate prefix
    OUTPUT: RESOLVE charter output for Touchpoint 1
    PRE: disable-model-invocation skill
    POST: no automatic TIED mutations
    EFFECTS: pure
  STRIP /xlate prefix
  PRELOAD tied-project/vocab/routing.md dispatch
  EMIT RESOLVE charter and refinement gate
  RETURN guidance
