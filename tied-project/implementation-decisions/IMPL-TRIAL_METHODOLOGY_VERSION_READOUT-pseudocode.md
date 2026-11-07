# IMPL-TRIAL_METHODOLOGY_VERSION_READOUT — essence pseudocode

```text
# [REQ-TRIAL_METHODOLOGY_VERSION_READOUT] [ARCH-TRIAL_METHODOLOGY_VERSION_READOUT] [IMPL-TRIAL_METHODOLOGY_VERSION_READOUT]
# Disposable trial client captures methodology semver for store facilitator readouts.

PROCEDURE WF_TRIAL_TURN1_CAPTURE_METHODOLOGY_VERSION
  # Implements REQ session capture via batch goal + prompt-shared doc
  PRE: tied-project/working/{REQ-TOKEN}/ exists; MCP or tied-cli available
  INPUT: REQ-TOKEN, optional IDE MCP
  CALL tied_config_get_base_path
  IF IDE MCP THEN CALL server_info ELSE CALL tied_cli_server_info
  OUTPUT: extensions.tied.methodology.version, .source
  WRITE evidence/tied-methodology-version.session.v1.json WITH schema session.v1
  MIRROR tied_methodology_version ON trial-workflow-interaction-inventory.v1.json
  POST: evidence file readable by @record-wf-trial glob
  EFFECTS: one line in phase-handoff-add-feature.md

PROCEDURE FACILITATOR_RESOLVE_TRIAL_METHODOLOGY_VERSION
  # Implements REQ metadata + ARCH resolution order
  PRE: subject client root with tied-project/
  FOR path IN ordered_fallback_list SEE record-wf-trial reference
    IF evidence found THEN RETURN version, source, label
  POST: readout metadata includes TIED methodology version (session)
  FAILURE_MODES: missing (1) -> label bootstrap-inferred only

PROCEDURE WF_PROCESS_LOG_ORCHESTRATOR_PIN
  # [REQ-TRIAL_METHODOLOGY_VERSION_READOUT] secondary DIAGNOSTIC only
  PRE: wf_trial_process_log_bind_workspace; node + workspace present
  CALL readTiedMethodologyVersionFromProjectRoot(workspace)
  APPEND stderr_log DIAGNOSTIC tied_methodology_version=…
  POST: process log may cite orchestrator pin; NOT canonical vs session file
```
