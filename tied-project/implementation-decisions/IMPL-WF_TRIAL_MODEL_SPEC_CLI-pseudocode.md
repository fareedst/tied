# [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [ARCH-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_SPEC_CLI] — Resolve WF trial config ids to MODEL_SLUG and MODEL_CONFIG.

Grammar-Version: v2

## Model spec resolver

- [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [ARCH-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_SPEC_CLI] How: Load wf-trial-model-specs.yaml; pick harness slug; export MODEL_CONFIG and MODEL_SLUG.

procedure WF_TRIAL_RESOLVE_MODEL_SPEC:
  # [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [ARCH-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_SPEC_CLI] How: Node loads registry; bash inc exports env from JSON stdout.
  Contract:
    INPUT: harness (cursor|claude); config_id; registry_path default docs/demos/wf-trial-model-specs.yaml
    OUTPUT: model_config string; model_slug string on stdout JSON for shell
    PRE: registry file exists and schema wf-trial-model-spec.v1
    POST: MODEL_CONFIG and MODEL_SLUG exported in caller shell when sourced via inc
    FAILURE_MODES: unknown_config_id; harness_not_supported_for_spec; registry_missing
    EFFECTS: env_export; subprocess_node
    TERMINATION: total on failure
  LOAD registry
  IF config_id missing THEN FAIL unknown_config_id
  LET spec := registry.specs[config_id]
  SET model_config := spec.model_config
  IF harness == cursor THEN
    IF spec.cursor_slug missing THEN FAIL harness_not_supported_for_spec
    SET model_slug := spec.cursor_slug
  ELSE IF harness == claude THEN
    IF spec.claude_slug missing THEN FAIL harness_not_supported_for_spec
    SET model_slug := spec.claude_slug
  ENDIF
  EMIT JSON { model_config, model_slug, config_id }
  RETURN

procedure WORKFLOW_TRIAL_RANGE:
  # [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_MODEL_SPEC_CLI] How: 5-arg batch helper resolves spec then loops wf-NN orchestrator calls.
  Contract:
    INPUT: harness; config_id; effort; end; start; optional monit_cmd
    OUTPUT: zero or more workflow_trial_agentstream invocations
    PRE: build-commands.sh sourced; resolver inc available
    POST: each iteration has consistent MODEL_CONFIG and MODEL_SLUG for cell
    FAILURE_MODES: resolve_failed; invalid_effort; orchestrator_nonzero
    EFFECTS: env_export MODEL_EFFORT; subprocess_orchestrator
    TERMINATION: partial on first orchestrator failure
  IF zero argc THEN print usage (5-arg) AND RETURN 0
  CALL WF_TRIAL_RESOLVE_MODEL_SPEC
  CALL wf_trial_validate_model_effort(effort)
  IF cursor AND composer-2.5 family AND effort set THEN EMIT DIAGNOSTIC once
  FOR num FROM start TO end
    CALL workflow_trial_agentstream wf-NN
  ENDFOR
  RETURN

procedure WORKFLOW_TRIAL_ORCHESTRATOR_CONFIG_HOOK:
  # [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_SPEC_CLI] How: When MODEL_CONFIG is registry id only, resolve before four-phase defaults.
  Contract:
    INPUT: MODEL_CONFIG; optional WF_TRIAL_CONFIG_ID; HARNESS
    OUTPUT: MODEL_SLUG and MODEL_CONFIG when resolve runs
    PRE: orchestrator past help dispatch
    POST: explicit MODEL_SLUG env wins over resolve (escape hatch)
    FAILURE_MODES: resolve_failed
    EFFECTS: env_export
    TERMINATION: total on failure when resolve required
  IF MODEL_SLUG already set by operator THEN SKIP resolve
  IF WF_TRIAL_CONFIG_ID set OR MODEL_CONFIG is known registry id THEN
    CALL WF_TRIAL_RESOLVE_MODEL_SPEC
  ENDIF
  RETURN
