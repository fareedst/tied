# IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL — essence pseudocode

<!-- [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] Classify orchestrator aborts from process logs before phase-handoff gate. -->

## WF_TRIAL_ABORT_CLASSIFY

```
// [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]
// PRE: workspace has optional process.stdout.log and process.stderr.log under wf-trial-orchestrator-run/evidence
// POST: WF_TRIAL_INCOMPLETE_REASON set when session limit or missing session_id turn detected
ACTIVE PROCEDURE WF_TRIAL_ABORT_CLASSIFY(workspace)
  INPUT: workspace path
  OUTPUT: exports WF_TRIAL_INCOMPLETE_REASON, WF_TRIAL_INCOMPLETE_TURN
  PRE: paths resolved under tied-project/working/wf-trial-orchestrator-run/evidence
  POST: reason empty when no signals; session limit preferred over missing session_id alone

  IF stdout contains "session limit" (case insensitive) THEN
    // [SC-WF-ABS-01]
    SET reason = claude_session_limit
  ENDIF

  missing_turn = SCAN stderr for turn banner without following session_id= line
  // [SC-WF-ABS-02]

  IF reason unset AND missing_turn present THEN
    SET reason = turn_missing_session_id
    SET turn = missing_turn
  ELSE IF reason = claude_session_limit AND missing_turn present THEN
    SET turn = missing_turn
  ENDIF

  EMIT DIAGNOSTIC wf_trial_incomplete_reason when reason set
  // [SC-WF-ABS-04] gate repeats DIAGNOSTIC before handoff ERROR
  MERGE manifest incomplete_reason, incomplete_turn when manifest exists and fields unset
END PROCEDURE
```
