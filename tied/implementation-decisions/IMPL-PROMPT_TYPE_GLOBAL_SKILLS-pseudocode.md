# [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
# Summary: Maintain a complete tracked prompt-type skill bundle and install it deterministically into TIED clients.
Contract:
  INPUT: TIED source root, client project root
  PRE: tools/bundled-prompt-type-skills contains the declared leaf skills, router, and shared references
  OUTPUT: client .cursor/skills contains the managed prompt-type bundle
  POST: every declared source file exists at the matching client path; unrelated client skills and existing MCP configuration are unchanged
  FAILURE_MODES: missing_source, copy_failed, contract_violation
  DATA: managed skill directory list, managed shared reference list, client skill directory
  DATA_TRANSITION: managed destination directories are replaced by the canonical source snapshot; unrelated destination entries remain unchanged
  EFFECTS: IO, State
  TERMINATION: total

procedure INVENTORY_PROMPT_TYPE_SKILLS(source_root):
  # [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: declare the exact 13 leaf skills, router, and 14 direct shared references so omissions fail deterministically.
  INPUT: source_root
  PRE: source_root is a readable directory
  OUTPUT: inventory of relative source paths
  POST: inventory contains only the managed prompt-type files and every path is relative to source_root
  EFFECTS: pure
  TERMINATION: total
  RETURN managed leaf SKILL.md paths, router SKILL.md path, and prompt-shared Markdown paths

procedure INSTALL_PROMPT_TYPE_SKILLS(source_root, client_root):
  # [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: refresh only the managed prompt-type directories under the client skill directory.
  INPUT: source_root, client_root
  PRE: source_root passes INVENTORY_PROMPT_TYPE_SKILLS; client_root is a writable client project
  OUTPUT: installation result
  POST: each inventory path is copied to client_root/.cursor/skills; unrelated skills and .cursor/mcp.json are unchanged
  FAILURE_MODES: missing_source, copy_failed
  EFFECTS: IO, State
  TERMINATION: total
  inventory = INVENTORY_PROMPT_TYPE_SKILLS(source_root)
  IF inventory fails: RETURN error missing_source
  REMOVE only managed prompt-type destination directories
  CREATE client_root/.cursor/skills when absent
  COPY each inventory path preserving relative directory structure
  RETURN success

procedure VALIDATE_PROMPT_TYPE_SKILL_CONTRACT(root):
  # [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] — How: verify exact names, explicit-only frontmatter, payload naming, direct shared-link resolution, and bounded file size before distribution.
  INPUT: bundle root or installed client skill root
  PRE: root is readable
  OUTPUT: pass or contract_violation diagnostics
  POST: pass means all managed files satisfy the acceptance contract
  FAILURE_MODES: contract_violation
  DATA: skill_markdown; payload_terms
  DATA_TRANSITION: unread skill_markdown -> pass or contract_violation diagnostics
  EFFECTS: IO
  TERMINATION: total
  CHECK inventory paths exist
  CHECK every SKILL.md name matches its directory
  CHECK every SKILL.md declares disable-model-invocation true
  CHECK every direct ../prompt-shared link resolves
  CHECK every SKILL.md is below 500 lines
  CHECK no SKILL.md uses a triple-colon payload delimiter
  CHECK plan-new-feature names invocation remainder and does not treat a linked plan as the request
  CHECK refine-plan and build-plan name linked plan and stop when none is present
  RETURN pass or diagnostics
