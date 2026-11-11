# [IMPL-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] [ARCH-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK]

Grammar-Version: v2

## SLIM_TRACKER_SEED

- [IMPL-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] Resolves product REQ from phase-handoff-add-feature; copy-if-absent slim template to working/{REQ}/checklist-tracker.yaml.
procedure MATERIALIZE_SLIM_TRACKER:
  Contract:
    INPUT: workspace, store_root
    OUTPUT: DIAGNOSTIC; optional checklist-tracker.yaml
    PRE: template at tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml
    POST: dest exists with request substituted; skip when dest already present
  token := RESOLVE_PRODUCT_REQ(workspace)
  IF token empty THEN DIAGNOSTIC skip RETURN
  IF dest exists THEN DIAGNOSTIC skip RETURN
  COPY template WITH {{PRODUCT_REQ}} -> token
