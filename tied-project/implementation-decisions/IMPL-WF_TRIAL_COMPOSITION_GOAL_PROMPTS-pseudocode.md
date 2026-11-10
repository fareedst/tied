# [IMPL-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS]

Grammar-Version: v2

## Goal-first catalog paste

- [IMPL-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] Rewrite PROMPT-WF-09..12 paste to goals-only; facilitator composition contract unchanged.

procedure VALIDATE_GOAL_FIRST_PASTE_CONTRACT:
  # [IMPL-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] Node test: forbid-list + TypeScript + no UI on paste blocks.
  Contract:
    INPUT: catalog markdown path
    OUTPUT: test pass/fail
    PRE: catalog contains updated fenced ```text blocks for 09-12
    POST: SC-GOAL-* satisfied; SC-GOAL-NO-ARCH satisfied
    EFFECTS: none
    FAILURE_MODES: assertion_fail
    TERMINATION: total on fail
  FOR each prompt id IN 09..12:
    EXTRACT fenced remainder
    ASSERT NOT matches FORBIDDEN architectural patterns
    ASSERT TypeScript AND automated tests AND no graphical UI
  RETURN pass

procedure UPDATE_CATALOG_PASTE_POLICY_SECTION:
  # [IMPL-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_PROMPTS] Facilitator-only paste policy prose.
  Contract:
    INPUT: catalog path
    OUTPUT: markdown with goal-first policy section
    PRE: build-plan authorized
    POST: links REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS; composition contract labeled grading-only
    EFFECTS: catalog file updated
    FAILURE_MODES: merge_conflict
    TERMINATION: total on write failure
  INSERT Paste policy section before Composition contract
  RELABEL composition contract as grading-only not paste
