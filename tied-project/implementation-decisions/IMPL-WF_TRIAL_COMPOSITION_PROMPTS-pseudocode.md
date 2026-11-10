# [IMPL-WF_TRIAL_COMPOSITION_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_PROMPTS]

Grammar-Version: v2

## Catalog and orchestrator

- [IMPL-WF_TRIAL_COMPOSITION_PROMPTS] [ARCH-WF_TRIAL_COMPOSITION_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_PROMPTS] Extend WF catalog with binding-test prompts 09–12 and orchestrator id range 01–12.

procedure NORMALIZE_WF_TRIAL_ID:
  # [IMPL-WF_TRIAL_COMPOSITION_PROMPTS] Accept WF-01..WF-12; reject wf-13+.
  Contract:
    INPUT: raw wf id string
    OUTPUT: uppercase WF-NN
    PRE: catalog contains matching PROMPT-WF-NN header
    POST: normalized id in range 01–12
    EFFECTS: none
    FAILURE_MODES: invalid_wf_id
    TERMINATION: total on invalid
  IF raw matches WF-(01..12) THEN RETURN normalized
  ELSE FAIL invalid_wf_id

procedure EXTRACT_PROMPT_WF_REMAINDER:
  # [IMPL-WF_TRIAL_COMPOSITION_PROMPTS] gawk extracts ```text block for PROMPT-WF-NN.
  Contract:
    INPUT: wf id; catalog path
    OUTPUT: feature remainder string
    PRE: gawk on PATH; catalog file exists
    POST: non-empty for 09–12 after catalog update
    EFFECTS: none
    FAILURE_MODES: missing_block; gawk_missing
    TERMINATION: total on extract failure
  SCAN catalog for ### PROMPT-WF-NN section
  EMIT lines until closing fence
  RETURN remainder

procedure VALIDATE_COMPOSITION_CATALOG_CONTRACT:
  # [IMPL-WF_TRIAL_COMPOSITION_PROMPTS] Node test: 12 headers; 09–12 binding language.
  Contract:
    INPUT: catalog markdown path
    OUTPUT: test pass/fail
    PRE: build-plan added sections
    POST: SC-CATALOG-09-12 satisfied
    EFFECTS: none
    FAILURE_MODES: assertion_fail
    TERMINATION: total on fail
