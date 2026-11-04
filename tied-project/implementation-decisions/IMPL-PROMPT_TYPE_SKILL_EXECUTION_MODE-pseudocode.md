# [IMPL-PROMPT_TYPE_SKILL_EXECUTION_MODE] [ARCH-PROMPT_TYPE_SKILL_EXECUTION_MODE] [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]
# Summary: Static contract validation for skill execution mode declarations and 18-leaf prompt-type inventory.

Contract:
  INPUT: bundled_skill_markdown_by_leaf: map where length(bundled_skill_markdown_by_leaf) == 18; plan_mode_leaf_ids; agent_mode_leaf_ids; test_contract
  OUTPUT: pass or contract_violation diagnostics
  PRE: canonical bundle paths readable; test_contract names execution mode strings and forbidden Implement links on plan leaves
  POST: pass means every plan leaf declares plan mode without tied-implement.md; every agent leaf declares agent mode; LEAF_SKILLS.length == 18
  FAILURE_MODES: missing_execution_mode; plan_leaf_links_implement; wrong_leaf_count; missing_shared_contract
  DATA: PLAN_MODE_LEAVES; AGENT_MODE_LEAVES; LEAF_SKILLS; diagnostics
  EFFECTS: none
  TERMINATION: total

Grammar-Version: v2

procedure VALIDATE_SKILL_EXECUTION_MODE_CONTRACT(bundled_skill_markdown_by_leaf, test_contract):
  # [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [ARCH-PROMPT_TYPE_SKILL_EXECUTION_MODE] [IMPL-PROMPT_TYPE_SKILL_EXECUTION_MODE] — How: static e2e asserts plan leaves omit tied-implement and inventory is 18
  Contract:
    INPUT: bundled_skill_markdown_by_leaf; test_contract
    PRE: bundled_skill_markdown_by_leaf has exactly 18 entries
    OUTPUT: pass or contract_violation diagnostics
    POST: each plan leaf body contains "skill execution mode: plan" and no tied-implement.md link; each agent leaf contains "skill execution mode: agent"
    FAILURE_MODES: missing_execution_mode; plan_leaf_links_implement; wrong_leaf_count
    DATA: leaf_id; skill_body; diagnostics
    EFFECTS: none
    TERMINATION: total
  FOR EACH leaf IN PLAN_MODE_LEAVES
    ASSERT skill body contains "skill execution mode: plan"
    ASSERT skill body does not link tied-implement.md
  FOR EACH leaf IN AGENT_MODE_LEAVES
    ASSERT skill body contains "skill execution mode: agent"
  ASSERT LEAF_SKILLS.length == 18
