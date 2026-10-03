# [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] — Stdd fleet migration governance orchestration (policy and schema contracts; no migration CLI in Phase 1).

Grammar-Version: v2

## Governance schema and gate policy

- [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate frozen schema IDs and gate promotion record before TIED close-out claims.

procedure VALIDATE_GOVERNANCE_SCHEMA_REFERENCES:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Ensure ARCH governance artifacts resolve to on-disk schema files.
  Contract:
    INPUT: repository_root: string where length(repository_root) > 0; governance_artifact_map from ARCH
    PRE: governance_artifact_map lists client-inventory-manifest.v1 and migration-waiver.v1 paths
    OUTPUT: validation_report with schema_id, path, ok
    POST:
      - success => every listed path exists and schema_version is 1 where applicable
      - error missing_path => report lists missing artifact without claiming fleet population
    FAILURE_MODES: missing_path, schema_version_mismatch
    EFFECTS: pure
  READ governance_artifact_map from ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE
  FOR each schema_entry IN governance_artifact_map
    IF file_missing(schema_entry.path) THEN
      RETURN validation_report WITH error missing_path FOR schema_entry
  RETURN validation_report WITH ok true

procedure PUBLISH_GATE_PROMOTION_RECORD:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Align machine-readable gate stages with OD-2 verification-first blocking policy.
  Contract:
    INPUT: gate_promotion_stages_path
    PRE: gate_promotion_stages_path points to gate-promotion-stages.v1.yaml
    OUTPUT: gate_alignment_report
    POST:
      - success => G2 and G3 stages show constraint_gate_errors verification blocking and pre_red advisory per OD-2
    FAILURE_MODES: stage_policy_drift
    EFFECTS: pure
  LOAD stages FROM gate_promotion_stages_path
  IF stages violate OD-2 blocking locus THEN
    RETURN gate_alignment_report WITH error stage_policy_drift
  RETURN gate_alignment_report WITH ok true

procedure RECORD_OD_P5_2_ACCEPTANCE:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate sponsor acceptance JSON before NB-1 build-plan unblocks Track B G3 waves.
  Contract:
    INPUT: acceptance_path; acceptance_schema_path
    PRE: acceptance_path points to od-p5-2-acceptance.v1.json; orchestrator REQ status is closed
    OUTPUT: acceptance_validation_report
    POST:
      - success => status is accepted AND orchestrator_reverify is false AND wave_1_client_ids length <= tranche_scope.max_clients
      - error invalid_acceptance => report lists schema or policy violation
    FAILURE_MODES: invalid_acceptance, orchestrator_reverify_true, tranche_over_cap
    EFFECTS: pure
  LOAD acceptance FROM acceptance_path
  VALIDATE acceptance AGAINST acceptance_schema_path
  IF acceptance.orchestrator_reverify != false THEN
    RETURN acceptance_validation_report WITH error orchestrator_reverify_true
  IF length(acceptance.wave_1_client_ids) > acceptance.tranche_scope.max_clients THEN
    RETURN acceptance_validation_report WITH error tranche_over_cap
  RETURN acceptance_validation_report WITH ok true

procedure SELECT_NB1_WAVE_ONE_CLIENTS:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Derive wave-1 client list from inventory manifest using not_enrolled and low sidecar burden.
  Contract:
    INPUT: inventory_manifest_path; max_clients; optional override_client_ids from acceptance JSON
    PRE: inventory_manifest_path is client-inventory-manifest.v1.yaml
    OUTPUT: wave_one_selection_report with client_ids
    POST:
      - success => every selected row has phase_4_enrollment not_enrolled_phase_4 AND aggregate_migration_state header-only-v2
      - error enrollment_mismatch => report lists client_id violating enrollment filter
    FAILURE_MODES: enrollment_mismatch, client_not_in_manifest
    EFFECTS: pure
  IF override_client_ids is present THEN
    FOR each client_id IN override_client_ids
      LOAD row FROM inventory WHERE client_id matches
      IF row.phase_4_enrollment != not_enrolled_phase_4 THEN
        RETURN wave_one_selection_report WITH error enrollment_mismatch FOR client_id
    RETURN wave_one_selection_report WITH client_ids override_client_ids
  SORT manifest rows BY total_sidecar_count ASC WHERE not_enrolled_phase_4
  RETURN wave_one_selection_report WITH client_ids first max_clients rows

procedure RECORD_NB2_ACCEPTANCE:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate sponsor NB-2 batch acceptance JSON before build-plan unblocks wave-2 G3 waves; NB-1 machine close-out must be referenced.
  Contract:
    INPUT: acceptance_path; acceptance_schema_path; nb1_close_out_receipt_path
    PRE: acceptance_path points to od-nb2-acceptance.v1.json; orchestrator REQ status is closed; nb1_close_out_receipt exists
    OUTPUT: nb2_acceptance_validation_report
    POST:
      - success => status is accepted AND orchestrator_reverify is false AND wave_2_client_ids length <= tranche_scope.max_clients AND prior_batch_complete.batch_id is NB-1
      - error invalid_acceptance => report lists schema or policy violation
    FAILURE_MODES: invalid_acceptance, orchestrator_reverify_true, tranche_over_cap, nb1_close_out_missing, prior_batch_mismatch
    EFFECTS: pure
  LOAD acceptance FROM acceptance_path
  VALIDATE acceptance AGAINST acceptance_schema_path
  IF acceptance.orchestrator_reverify != false THEN
    RETURN nb2_acceptance_validation_report WITH error orchestrator_reverify_true
  IF length(acceptance.wave_2_client_ids) > acceptance.tranche_scope.max_clients THEN
    RETURN nb2_acceptance_validation_report WITH error tranche_over_cap
  IF acceptance.prior_batch_complete.batch_id != NB-1 THEN
    RETURN nb2_acceptance_validation_report WITH error prior_batch_mismatch
  LOAD nb1_receipt FROM nb1_close_out_receipt_path
  IF nb1_receipt missing THEN
    RETURN nb2_acceptance_validation_report WITH error nb1_close_out_missing
  RETURN nb2_acceptance_validation_report WITH ok true

procedure SELECT_NB2_WAVE_TWO_CLIENTS:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Derive wave-2 client list from remaining header-only-v2 not_enrolled rows; exclude NB-1 fleet-migrated clients and default-excluded tooling rows.
  Contract:
    INPUT: inventory_manifest_path; max_clients; optional override_client_ids from acceptance JSON; default_excluded_client_ids
    PRE: inventory_manifest_path is client-inventory-manifest.v1.yaml
    OUTPUT: wave_two_selection_report with client_ids
    POST:
      - success => every selected row has phase_4_enrollment not_enrolled_phase_4 AND aggregate_migration_state header-only-v2
      - error enrollment_mismatch => report lists client_id violating enrollment or already fleet-migrated
    FAILURE_MODES: enrollment_mismatch, client_not_in_manifest, already_migrated
    EFFECTS: pure
  IF override_client_ids is present THEN
    FOR each client_id IN override_client_ids
      LOAD row FROM inventory WHERE client_id matches
      IF row.phase_4_enrollment != not_enrolled_phase_4 THEN
        RETURN wave_two_selection_report WITH error enrollment_mismatch FOR client_id
      IF row.aggregate_migration_state != header-only-v2 THEN
        RETURN wave_two_selection_report WITH error already_migrated FOR client_id
    RETURN wave_two_selection_report WITH client_ids override_client_ids
  SORT manifest rows BY total_sidecar_count ASC WHERE not_enrolled_phase_4 AND aggregate_migration_state header-only-v2 AND client_id NOT IN default_excluded_client_ids
  RETURN wave_two_selection_report WITH client_ids first max_clients rows

procedure RECORD_NB3_ACCEPTANCE:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate sponsor NB-3 batch acceptance JSON before build-plan unblocks wave-3 G3 waves; NB-2 machine close-out must be referenced.
  Contract:
    INPUT: acceptance_path; acceptance_schema_path; nb2_close_out_receipt_path
    PRE: acceptance_path points to od-nb3-acceptance.v1.json; orchestrator REQ status is closed; nb2_close_out_receipt exists
    OUTPUT: nb3_acceptance_validation_report
    POST:
      - success => status is accepted AND orchestrator_reverify is false AND wave_3_client_ids length <= tranche_scope.max_clients AND prior_batch_complete.batch_id is NB-2
      - error invalid_acceptance => report lists schema or policy violation
    FAILURE_MODES: invalid_acceptance, orchestrator_reverify_true, tranche_over_cap, nb2_close_out_missing, prior_batch_mismatch
    EFFECTS: pure
  LOAD acceptance FROM acceptance_path
  VALIDATE acceptance AGAINST acceptance_schema_path
  IF acceptance.orchestrator_reverify != false THEN
    RETURN nb3_acceptance_validation_report WITH error orchestrator_reverify_true
  IF length(acceptance.wave_3_client_ids) > acceptance.tranche_scope.max_clients THEN
    RETURN nb3_acceptance_validation_report WITH error tranche_over_cap
  IF acceptance.prior_batch_complete.batch_id != NB-2 THEN
    RETURN nb3_acceptance_validation_report WITH error prior_batch_mismatch
  LOAD nb2_receipt FROM nb2_close_out_receipt_path
  IF nb2_receipt missing THEN
    RETURN nb3_acceptance_validation_report WITH error nb2_close_out_missing
  RETURN nb3_acceptance_validation_report WITH ok true

procedure SELECT_NB3_WAVE_THREE_CLIENTS:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Derive wave-3 client list from remaining header-only-v2 not_enrolled rows after NB-2; exclude fleet-migrated NB-1/NB-2 clients and default-excluded tooling rows.
  Contract:
    INPUT: inventory_manifest_path; max_clients; optional override_client_ids from acceptance JSON; default_excluded_client_ids
    PRE: inventory_manifest_path is client-inventory-manifest.v1.yaml
    OUTPUT: wave_three_selection_report with client_ids
    POST:
      - success => every selected row has phase_4_enrollment not_enrolled_phase_4 AND aggregate_migration_state header-only-v2
      - error enrollment_mismatch => report lists client_id violating enrollment or already fleet-migrated
    FAILURE_MODES: enrollment_mismatch, client_not_in_manifest, already_migrated
    EFFECTS: pure
  IF override_client_ids is present THEN
    FOR each client_id IN override_client_ids
      LOAD row FROM inventory WHERE client_id matches
      IF row.phase_4_enrollment != not_enrolled_phase_4 THEN
        RETURN wave_three_selection_report WITH error enrollment_mismatch FOR client_id
      IF row.aggregate_migration_state != header-only-v2 THEN
        RETURN wave_three_selection_report WITH error already_migrated FOR client_id
    RETURN wave_three_selection_report WITH client_ids override_client_ids
  SORT manifest rows BY total_sidecar_count ASC WHERE not_enrolled_phase_4 AND aggregate_migration_state header-only-v2 AND client_id NOT IN default_excluded_client_ids
  RETURN wave_three_selection_report WITH client_ids first max_clients rows

procedure RECORD_NB4_ACCEPTANCE:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate sponsor NB-4 final tranche acceptance JSON before build-plan unblocks wave-4 G3 waves; NB-3 machine close-out must be referenced.
  Contract:
    INPUT: acceptance_path; acceptance_schema_path; nb3_close_out_receipt_path
    PRE: acceptance_path points to od-nb4-acceptance.v1.json; orchestrator REQ status is closed; nb3_close_out_receipt exists
    OUTPUT: nb4_acceptance_validation_report
    POST:
      - success => status is accepted AND orchestrator_reverify is false AND wave_4_client_ids length <= tranche_scope.max_clients AND prior_batch_complete.batch_id is NB-3
      - error invalid_acceptance => report lists schema or policy violation
    FAILURE_MODES: invalid_acceptance, orchestrator_reverify_true, tranche_over_cap, nb3_close_out_missing, prior_batch_mismatch
    EFFECTS: pure
  LOAD acceptance FROM acceptance_path
  VALIDATE acceptance AGAINST acceptance_schema_path
  IF acceptance.orchestrator_reverify != false THEN
    RETURN nb4_acceptance_validation_report WITH error orchestrator_reverify_true
  IF length(acceptance.wave_4_client_ids) > acceptance.tranche_scope.max_clients THEN
    RETURN nb4_acceptance_validation_report WITH error tranche_over_cap
  IF acceptance.prior_batch_complete.batch_id != NB-3 THEN
    RETURN nb4_acceptance_validation_report WITH error prior_batch_mismatch
  LOAD nb3_receipt FROM nb3_close_out_receipt_path
  IF nb3_receipt missing THEN
    RETURN nb4_acceptance_validation_report WITH error nb3_close_out_missing
  RETURN nb4_acceptance_validation_report WITH ok true

procedure SELECT_NB4_WAVE_FOUR_CLIENTS:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Derive wave-4 client list from remaining header-only-v2 not_enrolled rows after NB-3; exclude fleet-migrated NB-1..NB-3 clients and default-excluded tooling rows unless acceptance override lists them.
  Contract:
    INPUT: inventory_manifest_path; max_clients; optional override_client_ids from acceptance JSON; default_excluded_client_ids
    PRE: inventory_manifest_path is client-inventory-manifest.v1.yaml
    OUTPUT: wave_four_selection_report with client_ids
    POST:
      - success => every selected row has phase_4_enrollment not_enrolled_phase_4 AND aggregate_migration_state header-only-v2
      - error enrollment_mismatch => report lists client_id violating enrollment or already fleet-migrated
    FAILURE_MODES: enrollment_mismatch, client_not_in_manifest, already_migrated
    EFFECTS: pure
  IF override_client_ids is present THEN
    FOR each client_id IN override_client_ids
      LOAD row FROM inventory WHERE client_id matches
      IF row.phase_4_enrollment != not_enrolled_phase_4 THEN
        RETURN wave_four_selection_report WITH error enrollment_mismatch FOR client_id
      IF row.aggregate_migration_state != header-only-v2 THEN
        RETURN wave_four_selection_report WITH error already_migrated FOR client_id
    RETURN wave_four_selection_report WITH client_ids override_client_ids
  SORT manifest rows BY total_sidecar_count ASC WHERE not_enrolled_phase_4 AND aggregate_migration_state header-only-v2 AND client_id NOT IN default_excluded_client_ids
  RETURN wave_four_selection_report WITH client_ids first max_clients rows
