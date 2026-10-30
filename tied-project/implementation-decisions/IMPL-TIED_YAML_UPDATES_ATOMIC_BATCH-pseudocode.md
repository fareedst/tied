# [IMPL-TIED_YAML_UPDATES_ATOMIC_BATCH] [ARCH-TIED_YAML_UPDATES_ATOMIC_BATCH] [REQ-TIED_YAML_UPDATES_ATOMIC_BATCH] [REQ-TIED_INTENT_CONTROL_PLANE] — Atomic yaml_updates_apply with snapshot rollback.

Grammar-Version: v2

## APPLY_YAML_UPDATES_BATCH

procedure APPLY_YAML_UPDATES_BATCH(steps, dry_run, run_validate_consistency):
  Contract:
    INPUT: steps: ordered list of index|detail merge steps; dry_run: boolean; run_validate_consistency: boolean
    PRE: steps parsed; each step targets an existing project corpus record under getBasePath()
    OUTPUT: batch_result | batch_error
    POST: success implies all steps applied and optional consistency ok; failure implies no durable partial batch state
    FAILURE_MODES: STEP_SIMULATION_FAILED; STEP_WRITE_FAILED; CONSISTENCY_REJECTED; ROLLBACK_FAILED
    DATA_TRANSITION: corpus bytes either unchanged from batch start or fully updated per merged previews
    EFFECTS: IO, State
    TERMINATION: total

  # [IMPL-TIED_YAML_UPDATES_ATOMIC_BATCH] [ARCH-TIED_YAML_UPDATES_ATOMIC_BATCH] [REQ-TIED_YAML_UPDATES_ATOMIC_BATCH] — How: simulate all steps, snapshot unique target paths, write sequentially, rollback on failure.
  IF dry_run:
    FOR each step: simulate merge; RETURN previews without writes.
  Collect unique target file paths for all steps (detail path or project index file).
  FOR each path: snapshot bytes (absent file recorded as absent).
  FOR each step in order:
    Simulate merge; IF simulation fails: RETURN STEP_SIMULATION_FAILED.
    Write merged record via existing updateDetail or updateRecord (Wave 1 write binding applies).
    IF write fails: CALL RESTORE_BATCH_SNAPSHOTS; RETURN STEP_WRITE_FAILED.
  IF run_validate_consistency:
    Run tied_validate_consistency.
    IF report not ok: CALL RESTORE_BATCH_SNAPSHOTS; RETURN CONSISTENCY_REJECTED.
  RETURN batch success with step results.

## RESTORE_BATCH_SNAPSHOTS

procedure RESTORE_BATCH_SNAPSHOTS(snapshots):
  Contract:
    INPUT: snapshots: list of path and optional prior bytes
    PRE: snapshots captured at batch start
    OUTPUT: void | rollback_error
    POST: each path matches pre-batch presence and bytes
    FAILURE_MODES: ROLLBACK_FAILED
    EFFECTS: IO
    TERMINATION: total

  # [IMPL-TIED_YAML_UPDATES_ATOMIC_BATCH] — How: restore bytes or remove paths that did not exist before batch.
  FOR each snapshot entry:
    IF prior bytes absent: delete path if present.
    ELSE: write prior bytes to path (create parent dirs as needed).
