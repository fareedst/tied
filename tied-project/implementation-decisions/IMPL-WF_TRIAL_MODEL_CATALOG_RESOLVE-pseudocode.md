# [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE] [ARCH-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE]

Grammar-Version: v2

## Model ref resolver

- [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE] [ARCH-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] Two-tier resolve: matrix specs then catalog snapshot with harness aliases.

procedure WF_TRIAL_RESOLVE_MODEL_REF:
  Contract:
    INPUT: harness cursor|claude; model_ref string
    OUTPUT: model_config; model_slug; resolution matrix|alias|catalog
    PRE: wf-trial-model-specs.yaml and wf-trial-model-catalog.yaml present
    POST: MODEL_* exported in shell when called via inc.sh
    FAILURE_MODES: unknown_model_ref; harness_not_supported
    TERMINATION: total on failure
  IF matrix specs key model_ref THEN CALL matrix resolve AND RETURN
  IF alias[harness][model_ref] THEN model_ref := target; retry matrix key once
  IF matrix slug match for harness THEN CALL matrix resolve AND RETURN
  IF catalog slug match for harness THEN RETURN catalog row
  FAIL unknown_model_ref with sync hint

procedure SYNC_WF_TRIAL_MODEL_CATALOG:
  # [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] Snapshot agent models + Claude JSON into committed catalog.
  Contract:
    INPUT: agent models stdout; claude models JSON; matrix specs for derive
    OUTPUT: docs/demos/wf-trial-model-catalog.yaml
    EFFECTS: file_write
  PARSE agent lines to cursor slugs
  DERIVE model_config per slug via deriveCursorModelConfig
  PARSE claude data[].id
  EMIT catalog document with aliases.claude shortcuts
  IF --check THEN compare sans generated_at ELSE write file

procedure WORKFLOW_TRIAL_RANGE:
  # [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_SPEC_CLI] MODEL_REF positional replaces CONFIG_ID-only resolve.
  CALL WF_TRIAL_RESOLVE_MODEL_REF before loop
