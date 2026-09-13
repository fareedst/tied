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
