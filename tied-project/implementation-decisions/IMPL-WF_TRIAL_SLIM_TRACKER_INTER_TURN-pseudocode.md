# IMPL-WF_TRIAL_SLIM_TRACKER_INTER_TURN essence pseudo-code

```text
# [IMPL-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [ARCH-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN]
# Inter-turn slim checklist tracker reconcile for workflow trials.

PROCEDURE wf_trial_four_phase_run_interleaved(store_root, workspace, base_cmd)
  PRE: base_cmd is fully formed agentstream argv without order/resume
  POST: four successful turns OR first non-zero exit propagated
  FOR order IN 1..4
    EMIT DIAGNOSTIC phase banner
    INVOKE agentstream with --feature-spec-batch-order order and optional --resume
    ON non-zero exit: RETURN exit
    PARSE session_id from captured stdout
    IF order == 1: CALL wf_trial_reconcile_slim_checklist_tracker
  EFFECTS: marker file when replace occurred
  TERMINATION: after order 4 or abort
```