# [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE]

## Summary contract
# [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: expose the standalone feature-orchestrator binary as a thin adapter over shared orchestration services.
Contract:
  INPUT: argv
  PRE: argv uses the feature-orchestrator command grammar
  OUTPUT: structured stdout result and process status
  POST: equivalent requests produce the shared orchestration result schema
  FAILURE_MODES: INVALID_ARGUMENTS; SERVICE_ERROR
  DATA: orchestration service result
  DATA_TRANSITION: no direct mutation; delegated service owns state changes
  EFFECTS: IO
  TERMINATION: total

## RUN_FEATURE_ORCHESTRATOR
# [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: parse lifecycle arguments and delegate without mutating tied-cli.sh.
procedure RUN_FEATURE_ORCHESTRATOR(argv):
  # [IMPL-FEAT_ORCHESTRATION_CLI] [ARCH-FEAT_ORCHESTRATION_BOUNDARY] [REQ-FEAT_ORCHESTRATION_SURFACE] — How: parse lifecycle arguments and delegate without mutating tied-cli.sh.
  Parse argv into an orchestration service request.
  IF arguments are invalid: RETURN INVALID_ARGUMENTS.
  Invoke the shared orchestration command adapter.
  Serialize the result deterministically.
  RETURN result and status.
