# [IMPL-WF_TRIAL_COMPOSITION_SOC_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_SOC_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS]

Grammar-Version: v2

## Goal-first-soc catalog paste (WF-10..12)

- [IMPL-WF_TRIAL_COMPOSITION_SOC_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_SOC_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS] Replace PROMPT-WF-10..12 paste with resource-contract stress; WF-09 unchanged; facilitator composition contract unchanged.

procedure VALIDATE_SOC_PASTE_CONTRACT:
  # [IMPL-WF_TRIAL_COMPOSITION_SOC_PROMPTS] Extend goal-first contract with SC-GOAL-BEHAVIOR-10/11/12.
  Contract:
    INPUT: catalog markdown path
    OUTPUT: test pass/fail
    PRE: catalog contains locked fenced blocks per PLAN
    POST: SC-GOAL-* and SC-GOAL-NO-ARCH satisfied; WF-09 block unchanged
    EFFECTS: none
    FAILURE_MODES: assertion_fail
    TERMINATION: total on fail
  FOR each prompt id IN 10..12:
    EXTRACT fenced remainder
    ASSERT NOT matches FORBIDDEN architectural patterns
    ASSERT behavior anchors per SC-GOAL-BEHAVIOR-NN
  FOR prompt id 09:
    ASSERT concurrent order preservation unchanged
  RETURN pass

procedure UPDATE_CATALOG_PASTE_POLICY_GOAL_FIRST_SOC:
  # [IMPL-WF_TRIAL_COMPOSITION_SOC_PROMPTS] Facilitator paste generation label for 10-12.
  Contract:
    INPUT: catalog path
    OUTPUT: markdown with goal-first-soc note on WF-10..12
    PRE: build-plan authorized
    POST: links REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS; WF-09 remains goal-first (2026-11-10)
    EFFECTS: catalog file updated
    FAILURE_MODES: merge_conflict
    TERMINATION: total on write failure
  EXTEND Paste policy section with goal-first-soc generation date for prompts 10-12
  RETURN ok
