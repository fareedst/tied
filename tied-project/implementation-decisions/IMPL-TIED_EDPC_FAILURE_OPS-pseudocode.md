# [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] — Operational Failure State Model validate and build

Grammar-Version: v2

## Failure state validation

procedure VALIDATE_EDPC_FAILURE_STATE:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Fail-closed OFSM v1 bundle checks for Workflow D — observation window, health classifications, tier/touch, and critical_outcome coverage.
  Contract:
    INPUT: charter, access_matrix, ofsm_bundle, optional_claims_ledger
    OUTPUT: validation_result
    PRE: access_matrix includes evidence_access_tier and production_touch
    POST: no aggregate summary_healthy when row-level evidence missing; every critical_outcome classified or blind_spot gap recorded
    EFFECTS: pure
    FAILURE_MODES: invalid_bundle; forbidden_prod_observed; blanket_health; missing_observation_window
    TERMINATION: total
  CALL assertObservationWindow(ofsm_bundle.observation_window)
  CALL assertHealthSnapshotRows(charter.critical_outcomes, ofsm_bundle.health_snapshot)
  CALL assertClassificationRules(ofsm_bundle.health_snapshot, access_matrix)
  CALL assertNoBlanketHealthy(ofsm_bundle)
  RETURN validation_result

procedure ASSERT_OBSERVATION_WINDOW:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: EDPC principle 7 requires start, end, timezone, environment on present-state claims.
  Contract:
    INPUT: observation_window
    OUTPUT: diagnostics
    PRE: observation_window object present
    POST: diagnostics empty when all required fields non-empty strings
    EFFECTS: pure
    TERMINATION: total
  IF missing start OR end OR timezone OR environment THEN APPEND missing_observation_window_field
  RETURN diagnostics

procedure ASSERT_CLASSIFICATION_RULES:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Reject invalid enum; healthy_within_observed_scope requires evidence_ids; Observed prod health blocked when production_touch is none.
  Contract:
    INPUT: health_snapshot, access_matrix
    OUTPUT: diagnostics
    PRE: health_snapshot.rows is array
    POST: diagnostics capture tier/touch violations and invalid classifications
    EFFECTS: pure
    TERMINATION: total
  FOR EACH row IN health_snapshot.rows DO
    IF row.classification NOT IN allowed_health_enums THEN APPEND invalid_classification
    IF row.classification IS healthy_within_observed_scope AND row.evidence_ids is empty THEN APPEND health_evidence_required
    IF row.claim_class IS Observed AND row.evidence_source IS production AND access_matrix.production_touch IS none THEN APPEND forbidden_prod_observed
  RETURN diagnostics

procedure ASSERT_CRITICAL_OUTCOME_COVERAGE:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Every charter critical_outcome appears in snapshot rows or explicit blind_spot gap list on bundle.
  Contract:
    INPUT: critical_outcomes, health_snapshot, blind_spot_gaps
    OUTPUT: diagnostics, coverage_gaps
    PRE: critical_outcomes is non-empty array when charter mandates outcomes
    POST: coverage_gaps lists blind_spot:{outcome_id} for uncovered outcomes
    EFFECTS: pure
    TERMINATION: total
  FOR EACH outcome IN critical_outcomes DO
    IF outcome NOT IN health_snapshot.outcome_ids AND outcome NOT IN blind_spot_gaps THEN APPEND blind_spot gap
  RETURN diagnostics, coverage_gaps

## Failure state build

procedure BUILD_EDPC_FAILURE_STATE:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Normalize bundle index JSON and attach operational_failure_state receipt ref on SCM shell.
  Contract:
    INPUT: ofsm_bundle, scm_shell
    OUTPUT: build_result, normalized_bundle
    PRE: VALIDATE_EDPC_FAILURE_STATE ok OR caller accepts diagnostics-only build
    POST: scm_shell.receipt_refs.operational_failure_state set to bundle path; keys sorted stably
    EFFECTS: pure merge (no filesystem write in unit module)
    TERMINATION: total
  CALL VALIDATE_EDPC_FAILURE_STATE
  CALL mergeOperationalFailureStateRef(scm_shell, ofsm_bundle.bundle_path)
  CALL stableSortJsonKeys(normalized_bundle)
  RETURN build_result, normalized_bundle

procedure MCP_TIED_EDPC_FAILURE_STATE_VALIDATE:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP wrapper returning diagnostics JSON for OFSM paths under working evidence/edpc.
  Contract:
    INPUT: charter, access_matrix, ofsm_bundle
    OUTPUT: validation_result
    PRE: read-only on project TIED YAML
    POST: JSON diagnostics + ok flag
    EFFECTS: read artifacts only
    TERMINATION: total
  CALL VALIDATE_EDPC_FAILURE_STATE
  RETURN validation_result

procedure MCP_TIED_EDPC_FAILURE_STATE_BUILD:
  # [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP wrapper merging OFSM ref into scm shell and returning normalized bundle attachment JSON.
  Contract:
    INPUT: charter, access_matrix, ofsm_bundle, scm_shell
    OUTPUT: build_result
    PRE: paths under project working root
    POST: build_result includes merged shell fragment and normalized bundle
    EFFECTS: read artifacts only
    TERMINATION: total
  CALL BUILD_EDPC_FAILURE_STATE
  RETURN build_result
