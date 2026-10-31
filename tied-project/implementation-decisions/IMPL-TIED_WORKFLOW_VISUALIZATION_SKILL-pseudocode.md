# [IMPL-TIED_WORKFLOW_VISUALIZATION_SKILL] [ARCH-TIED_WORKFLOW_VISUALIZATION_SKILL_BOUNDARY] [REQ-TIED_WORKFLOW_VISUALIZATION_SKILL] — Workflow visualization standalone skill.

Grammar-Version: v2

## Workflow visualization skill bootstrap

procedure REGISTER_WORKFLOW_VISUALIZATION_IN_STANDALONE_MANIFEST:
  # [IMPL-TIED_WORKFLOW_VISUALIZATION_SKILL] [ARCH-TIED_WORKFLOW_VISUALIZATION_SKILL_BOUNDARY] [REQ-TIED_WORKFLOW_VISUALIZATION_SKILL] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] How: manifest skillName workflow-visualization storeDir tools/bundled-workflow-visualization-skill; installed via INSTALL_STANDALONE_SKILLS_COPY.
  Contract:
    INPUT: { manifest.json }
    OUTPUT: { skill_name: workflow-visualization }
    PRE: tools/bundled-workflow-visualization-skill/SKILL.md and reference.md exist
    POST: tied-install places .cursor/skills/workflow-visualization and .claude/skills/workflow-visualization
    DATA: client skills dirs
    DATA_TRANSITION: absent standalone row to registered workflow-visualization skill
    EFFECTS: IO
  ASSERT manifest lists workflow-visualization
  RETURN skill_name

procedure WORKFLOW_VISUALIZATION_SKILL_PROCEDURE:
  # [IMPL-TIED_WORKFLOW_VISUALIZATION_SKILL] [REQ-TIED_WORKFLOW_VISUALIZATION_SKILL] [REQ-TIED_EDPC_COMPREHENSION] How: read-only comprehension inputs; workflow inventory; compose hub and optional satellite docs under output_dir; Verification gaps header; never invent services; no TIED or src mutation on target repo.
  Contract:
    INPUT: sponsor message with optional /workflow-visualization prefix and paths or request_token
    OUTPUT: docs/<project>-workflows.md and optional satellite markdown files
    PRE: disable-model-invocation skill; evidence tier recorded
    POST: no REQ/ARCH/IMPL writes; no src edits; no connection strings in output
    DATA: target docs markdown and workflow inventory
    DATA_TRANSITION: comprehension artifacts to hub and optional satellite markdown under output_dir
    EFFECTS: IO when writing docs/
  STRIP prefix
  RESOLVE read-only edpc and report artifacts
  BUILD workflow inventory
  COMPOSE per reference visualization catalog
  WRITE hub and optional satellites
  RETURN summary with gaps
