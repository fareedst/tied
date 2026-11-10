# [IMPL-WF_TRIAL_MODEL_COMPOSE] [ARCH-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_COMPOSE]

Grammar-Version: v2

## Compose resolve

- [IMPL-WF_TRIAL_MODEL_COMPOSE] [ARCH-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_COMPOSE] Extend resolve-ref with effort; compose Cursor families before matrix; tier conflict after matrix/catalog.

procedure COMPOSE_CURSOR_CATALOG_SLUG:
  # [IMPL-WF_TRIAL_MODEL_COMPOSE] [ARCH-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_COMPOSE] Build slug + config from compose family + effort.
  Contract:
    INPUT: familyKey string; effort tier; compose family record from specs
    OUTPUT: model_slug; model_config
    PRE: specs schema v2; catalog snapshot loaded
    POST: composed slug exists in catalog.cursorBySlug
    EFFECTS: none (pure resolve)
    FAILURE_MODES: effort_required_for_compose; composed_slug_not_in_catalog
    TERMINATION: total on failure
  IF effort is empty OR dash THEN FAIL effort_required_for_compose
  IF family.effort_in_slug is false THEN slug := catalog_base + speed_suffix ONLY
  ELSE slug := catalog_base + effort + speed_suffix
  model_config := model_config_prefix + hyphen + med-abbrev(effort)
  IF slug not in catalog THEN FAIL composed_slug_not_in_catalog
  RETURN model_slug slug; model_config

procedure WF_TRIAL_RESOLVE_MODEL_REF_COMPOSE:
  # [IMPL-WF_TRIAL_MODEL_COMPOSE] [ARCH-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_COMPOSE] Alias then compose then matrix/catalog with tier guard.
  Contract:
    INPUT: harness; model_ref; effort optional
    OUTPUT: model_config; model_slug; resolution compose|matrix|alias|catalog
    PRE: registry + catalog present
    POST: shell exports MODEL_* when called from inc.sh
    EFFECTS: none
    FAILURE_MODES: tier_mismatch; same as catalog resolve
    TERMINATION: total on failure
  AFTER alias hop IF cursor AND model_ref in compose THEN CALL COMPOSE_CURSOR_CATALOG_SLUG AND RETURN compose
  ELSE existing matrix and catalog path
  AFTER matrix or catalog resolve IF effort set AND slug has embedded tier THEN ASSERT tier matches effort OR FAIL tier_mismatch

procedure WORKFLOW_TRIAL_RANGE_COMPOSE:
  # [IMPL-WF_TRIAL_MODEL_COMPOSE] [ARCH-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_COMPOSE] [REQ-WF_TRIAL_MODEL_SPEC_CLI] Pass EFFORT into resolve-ref before exporting MODEL_EFFORT.
  Contract:
    INPUT: harness; model_ref; effort; loop bounds
    OUTPUT: MODEL_SLUG; MODEL_CONFIG; optional MODEL_EFFORT
    PRE: build-commands sourced
    POST: resolve before workflow_trial_agentstream loop
    EFFECTS: shell export MODEL_SLUG MODEL_CONFIG MODEL_EFFORT
    FAILURE_MODES: resolve errors propagate
    TERMINATION: total on resolve failure
  CALL WF_TRIAL_RESOLVE_MODEL_REF_COMPOSE with harness model_ref effort
  EXPORT MODEL_EFFORT from effort positional when not dash
