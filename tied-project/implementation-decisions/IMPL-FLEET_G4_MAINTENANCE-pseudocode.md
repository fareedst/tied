# [IMPL-FLEET_G4_MAINTENANCE] [ARCH-PSEUDOCODE_FLEET_G4_MAINTENANCE] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
# Summary: Local G4 maintenance wrapper — compose checks, optional tests, refresh program-status, write last-run receipt (post–Track B ops).

Grammar-Version: v2

PROC RUN_FLEET_G4_MAINTENANCE(repoRoot, options)
  PRE: repoRoot is stdd; gate-promotion G4 stage and program-status paths exist; orchestrator REQ remains closed
  POST: on full success last_g4_ci_ok true and receipt ok true; on any failure exit non-zero and last_g4_ci_ok false
  EFFECTS: invokes runFleetG4CiChecks; optional node --test fleet-g4 suite; YAML-safe merge into program-status.v1.yaml; writes g4-maintenance/last-run.v1.json
  FAILURE_MODES: G4_CHECK_FAILED; UNIT_TEST_FAILED; STATUS_WRITE_FAILED; RECEIPT_WRITE_FAILED
  TERMINATION: single maintenance pass

  # [IMPL-FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE] How: Delegate to existing P5-E runFleetG4CiChecks (header defaults, stale waivers, enrolled_track_regression).
  CALL RUN_G4_CI_CHECKS(repoRoot)

  # [IMPL-FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE] How: Unless options.skip_tests, run fleet-g4-ci-checks.test.mjs and validate-feat-spawned-envelope-policy.test.mjs.
  IF NOT options.skip_tests THEN CALL RUN_G4_UNIT_TESTS(repoRoot)

  # [IMPL-FLEET_G4_MAINTENANCE] [ARCH-PSEUDOCODE_FLEET_G4_MAINTENANCE] How: Merge generated_at from report; never set last_g4_ci_ok true when report.ok is false.
  CALL REFRESH_PROGRAM_STATUS(repoRoot, report)

  # [IMPL-FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE] How: Persist fleet-g4-maintenance-run.v1 envelope embedding full G4 report.
  CALL WRITE_MAINTENANCE_RECEIPT(repoRoot, report, options)
