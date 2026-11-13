# IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW — essence_pseudocode

```text
# [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]
# Routes wf-meter-01 through metering catalog while preserving WF-01…WF-12 traditional catalog path.

PROCEDURE WF_TRIAL_IS_METER_WF_ID
  # [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]
  # SC-HEMC-02: M1 allows only WF-METER-01 as metering id.
  PRE: wf_norm uppercased
  POST: true only when wf_norm equals WF-METER-01
  INPUT: wf_norm string
  OUTPUT: boolean
  CONTROL: strict equality on WF-METER-01 only
  EFFECTS: none
  TERMINATION: returns

PROCEDURE RESOLVE_WF_TRIAL_CATALOG_REL
  # [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]
  # D-CATALOG-SPLIT selects metering vs traditional catalog path.
  PRE: wf_norm valid per NORMALIZE_WF_ID
  POST: relative path under repo docs/demos/
  INPUT: wf_norm
  OUTPUT: catalog_rel string
  DATA: catalog_rel basename
  CONTROL: branch on WF_TRIAL_IS_METER_WF_ID
  DATA_TRANSITION: meter id -> catalog-harness-metering-lite-workflow.md else traditional catalog
  EFFECTS: none
  TERMINATION: single line path

PROCEDURE NORMALIZE_WF_ID
  # [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG]
  # Accept WF-METER-01 and WF-01…12 for tag and catalog routing.
  PRE: raw wf id from argv
  POST: canonical WF_* id or fail invalid
  INPUT: raw string
  OUTPUT: WF_NORM
  DATA: uppercase wf token
  CONTROL: accept WF-01…12 or WF-METER-01 only
  EFFECTS: fail exits process on unknown id
  FAILURE_MODES: unknown id -> ERROR invalid WF id
  TERMINATION: print WF_NORM or exit

PROCEDURE EXTRACT_FEATURE_REMAINDER
  # [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]
  # D-EXTRACT-GAWK: delimiter ^### PROMPT- exclusive of current hdr.
  PRE: catalog file exists; hdr ### PROMPT-{WF_NORM}
  POST: non-empty paste remainder for FEATURE_REMAINDER
  INPUT: WF_NORM, catalog absolute path
  OUTPUT: body text
  DATA: FEATURE_REMAINDER source text
  CONTROL: gawk section hdr ### PROMPT-{WF_NORM}
  EFFECTS: gawk prints remainder lines to stdout
  FAILURE_MODES: empty body -> orchestrator fail before four-phase
  TERMINATION: print body lines
```
