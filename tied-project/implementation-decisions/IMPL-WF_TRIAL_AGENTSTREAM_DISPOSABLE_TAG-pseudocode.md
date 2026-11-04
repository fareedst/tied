# IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG — essence_pseudocode

```text
# [IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [ARCH-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG]
# Implements fair-comparison disposable dirname encoding for workflow-trial-agentstream bootstrap.

PROCEDURE NORMALIZE_WF_TRIAL_MODEL_SUFFIX
  # [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] Derive modelBucket for --tag from operator env.
  PRE: MODEL_CONFIG and MODEL_SLUG may be unset before orchestrator defaults apply
  POST: Returns lowercase string with no '.' or '-' characters
  INPUT: env MODEL_CONFIG, env MODEL_SLUG
  OUTPUT: modelBucket string
  DATA: raw ← MODEL_CONFIG when non-empty else MODEL_SLUG default composer-2.5-fast
  EFFECTS: tr lowercase; tr delete .-
  TERMINATION: always returns one line

PROCEDURE BUILD_WF_TRIAL_DISPOSABLE_TAG
  # [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] Compose new-tied-client --tag for matrix cells.
  PRE: normalize_wf_tag_suffix available; HARNESS/MODEL_* exported with defaults
  POST: Tag matches wf-agentstream-{wf-id}-{harness}-{modelBucket} and validateDisposableTag pattern
  INPUT: wf_id string
  OUTPUT: tag string
  DATA: wf_suffix ← normalize_wf_tag_suffix(wf_id); harness ← lowercase HARNESS default cursor; model ← NORMALIZE_WF_TRIAL_MODEL_SUFFIX
  EFFECTS: printf wf-agentstream-%s-%s-%s
  FAILURE_MODES: invalid wf_id fails in normalize_wf_id before tag build
  TERMINATION: single line tag

PROCEDURE WORKFLOW_TRIAL_BOOTSTRAP_TAG
  # [REQ-TIED_SETUP] [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] Orchestrator calls factory when --workspace absent.
  PRE: REPO_ROOT valid; WF_ID valid; MODEL/HARNESS defaults exported before bootstrap branch
  POST: WORKSPACE absolute path; TAG set for DEBUG when bootstrap used
  INPUT: WF_ID, optional WORKSPACE_ARG
  OUTPUT: WORKSPACE, TAG
  DATA_TRANSITION: when WORKSPACE_ARG empty → TAG ← BUILD_WF_TRIAL_DISPOSABLE_TAG(WF_ID) → new-tied-client.mjs --disposable --tag TAG
  EFFECTS: export WORKSPACE from factory stdout
  TERMINATION: continue to four-phase wrapper
```
