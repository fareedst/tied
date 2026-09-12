# [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] — Stdd fleet migration governance orchestration (policy and schema contracts; no migration CLI in Phase 1).

Grammar-Version: v2

## Governance schema and gate policy

- [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Validate frozen schema IDs and gate promotion record before TIED close-out claims.

procedure VALIDATE_GOVERNANCE_SCHEMA_REFERENCES:
  # [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Ensure ARCH governance artifacts resolve to on-disk schema files.
  Contract:
    INPUT: repository_root, governance_artifact_map from ARCH
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
