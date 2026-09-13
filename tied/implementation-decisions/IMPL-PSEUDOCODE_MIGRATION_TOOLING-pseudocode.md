# [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] — Pilot migration tooling (inventory, dry-run, G2 receipts, revert).

Grammar-Version: v2

## Pilot migration workflow

- [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Deterministic pilot inventory scan and receipt emit without fleet-wide CI blocking.

procedure BUILD_PILOT_INVENTORY:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Classify in-scope sidecars and write inventory-diff with dry_run_content_hash.
  Contract:
    INPUT: wave_sidecar_list: list of SidecarRef where length(wave_sidecar_list) > 0, repository_root, dry_run_flag
    PRE: wave_sidecar_list has ≤10 entries per sub-wave (OD-P3-3)
    OUTPUT: inventory_diff_path, dry_run_content_hash
    POST:
      - success => inventory_diff_path exists under working/fleet-constraint-v2/pilots/{client_id}/dry-run/
      - success => hash stable when sidecar bytes unchanged
    FAILURE_MODES: missing_sidecar, invalid_wave_list
    EFFECTS: IO when dry_run_flag is false and assist actions apply
  FOR each sidecar IN wave_sidecar_list
    CLASSIFY migration state FROM sidecar preamble and annotations
  EMIT inventory-diff.v1.json WITH dry_run_content_hash
  RETURN inventory_diff_path, dry_run_content_hash

procedure RUN_MIGRATION_DRY_RUN:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Plan assist-only edits (v2 header) without Tier-3 auto-generation (OD-P3-4).
  Contract:
    INPUT: inventory_diff_path
    PRE: inventory_diff_path readable
    OUTPUT: planned_actions_report
    POST: success => no file writes when dry_run true
    FAILURE_MODES: hash_mismatch_on_rerun
    EFFECTS: pure when dry_run true
  LOAD inventory_diff FROM inventory_diff_path
  RETURN planned_actions_report WITH dry_run_content_hash

procedure EMIT_MIGRATION_RECEIPT:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Project pseudocode_analyze into constraint-migration-receipt.v1 at gate_stage G2.
  Contract:
    INPUT: sidecar_path, impl_token, analyze_profile
    PRE: sidecar_path exists; analyze_profile includes gate_mode and constraint_flow
    OUTPUT: receipt_path
    POST:
      - success => receipt validates against constraint-migration-receipt.v1 schema
      - success => receipt_meta.gate_stage is G2 for pilot emits
    FAILURE_MODES: analyze_failure, schema_validation_failure
    EFFECTS: IO — writes receipt JSON
  RUN pseudocode_analyze WITH analyze_profile
  BUILD receipt WITH gate_stage G2 AND program_gate_policy advisory
  WRITE receipt_path UNDER working/fleet-constraint-v2/pilots/{client_id}/receipts/
  RETURN receipt_path

procedure REVERT_MIGRATION_APPLY:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Restore sidecar bytes from dry-run snapshot; re-emit advisory G2 receipt without analyzer code revert.
  Contract:
    INPUT: sidecar_snapshot_bytes, sidecar_path
    PRE: snapshot captured before apply
    OUTPUT: revert_report, advisory_receipt_path
    POST: success => sidecar bytes match snapshot; advisory receipt constraint_gate_errors_policy is advisory
    FAILURE_MODES: snapshot_missing, restore_hash_mismatch
    EFFECTS: IO — restores sidecar file
  RESTORE sidecar_path FROM sidecar_snapshot_bytes
  CALL EMIT_MIGRATION_RECEIPT WITH advisory analyze_profile
  RETURN revert_report, advisory_receipt_path

## Fleet wave migration workflow (Phase 4 G3)

- [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Full inventory, G3 wave execution, waiver registry, and stop/go for OD-P4-3 enrolled clients.

procedure BUILD_FLEET_INVENTORY:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Merge qualification manifest client IDs with full inventory instance stdd-fleet-inventory-v1 and phase_4_enrollment flags.
  Contract:
    INPUT: partition_path, inventory_manifest_path, methodology_pin
    PRE: inventory_manifest_path validates against client-inventory-manifest.v1 schema
    OUTPUT: refreshed_inventory_path, enrollment_summary
    POST:
      - success => every OD-P4-3 enrolled client_id row has falsifiable aggregate_migration_state
      - success => non-enrolled rows remain not_enrolled_phase_4 unless waiver documented
    FAILURE_MODES: schema_validation_failure, missing_enrolled_client_row
    EFFECTS: IO — writes inventory manifest when refresh flag set
  LOAD fleet-wave-partition FROM partition_path
  FOR each client_id IN partition enrolled set
    CLASSIFY sidecar counts BY migration state FROM repository scan
  EMIT client-inventory-manifest.v1 WITH phase_4_enrollment
  RETURN refreshed_inventory_path, enrollment_summary

procedure EMIT_G3_RECEIPT:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Project pseudocode_analyze with constraint_flow true into constraint-migration-receipt.v1 at gate_stage G3.
  Contract:
    INPUT: sidecar_path, impl_token, analyze_profile G3
    PRE: sidecar_path exists; analyze_profile includes constraint_flow true and typed_flow true
    OUTPUT: receipt_path
    POST:
      - success => receipt validates against constraint-migration-receipt.v1 schema
      - success => receipt_meta.gate_stage is G3; unknown_summary disclosed when present
      - success => waiver_policy require_active_waiver_or_receipt satisfied on annotated loci
    FAILURE_MODES: analyze_failure, schema_validation_failure, expired_waiver_blocking
    EFFECTS: IO — writes receipt JSON under working/fleet-constraint-v2/waves/{client_id}/receipts/
  RUN pseudocode_analyze WITH G3 analyze_profile AND program_gate_policy advisory
  BUILD receipt WITH gate_stage G3 AND layer_c constraint_flow true
  WRITE receipt_path
  RETURN receipt_path

procedure RUN_FLEET_WAVE:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Execute one wave from fleet-wave-partition with ≤10 sidecars per stdd sub-wave (W-stdd-2..N dependency-first).
  Contract:
    INPUT: wave_id, sidecar_list_path, dry_run_flag, gate_stage G3
    PRE: wave_id exists in partition; sidecar_list has ≤10 entries when client is stdd
    OUTPUT: wave_run_report, receipt_dir
    POST:
      - success => dry_run produces stable dry_run_content_hash when bytes unchanged
      - success => gate_stage on emitted receipts is G3 for Phase 4 fleet waves
    FAILURE_MODES: wave_blocked_by_prior_stop_go, sidecar_list_overflow, hash_mismatch_on_rerun
    EFFECTS: IO when dry_run_flag is false and apply authorized
  LOAD sidecar_list FROM sidecar_list_path
  CALL BUILD_FLEET_INVENTORY WHEN inventory stale
  FOR each sidecar IN sidecar_list
    CALL EMIT_G3_RECEIPT
  RETURN wave_run_report, receipt_dir

procedure RECORD_WAVE_STOP_GO:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] How: Append single-file wave-stop-go.v1.json entry per OD-P4-6 with F11/FP regression reference.
  Contract:
    INPUT: wave_id, disposition go_or_stop, evidence_refs, f11_fp_thresholds_path
    PRE: wave_id completed receipt batch OR blocking gap documented
    OUTPUT: stop_go_record_path
    POST:
      - success => append-only array entry validates against wave-stop-go.v1.schema.json
      - success => stop disposition references f11-fp-thresholds when regression triggered
    FAILURE_MODES: blocking_evidence_gap, schema_validation_failure
    EFFECTS: IO — appends to working/fleet-constraint-v2/wave-stop-go.v1.json
  APPEND entry TO wave-stop-go.v1.json WITH wave_id AND disposition
  RETURN stop_go_record_path

procedure REFRESH_WAIVER_REGISTRY:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] How: Validate migration-waiver-registry.v1 against migration-waiver.v1 schema; reject expired waivers at wave close-out.
  Contract:
    INPUT: registry_path, as_of_date
    PRE: registry_path readable
    OUTPUT: registry_report, active_waiver_ids
    POST:
      - success => every active waiver validates against migration-waiver.v1.schema.json
      - success => expired waivers flagged blocking for G3 wave close-out
    FAILURE_MODES: expired_waiver_blocking, schema_validation_failure
    EFFECTS: IO when registry rows added or renewed
  LOAD waivers FROM migration-waiver-registry.v1.yaml
  FOR each waiver IN waivers
    IF expiry BEFORE as_of_date THEN mark blocking FOR wave close-out
  RETURN registry_report, active_waiver_ids

procedure APPLY_FLEET_WAVE_ASSIST:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: APPLY_MIGRATION_ASSIST for stdd — insert Grammar-Version v2 on in-scope partition wave lists only; dry-run hash gate before apply; byte snapshots for revert.
  Contract:
    INPUT: wave_id OR all_legacy_flag, repository_root, apply_flag, force_flag, receipts_refresh_flag
    PRE:
      - sidecar paths limited to fleet-wave-partition wave sidecar_list_path entries (stdd repo-relative or enrolled external absolute paths)
      - apply_flag false => no sidecar writes
      - apply_flag true => prior dry_run_content_hash matches recomputed hash OR force_flag true
    OUTPUT: apply_diff_path, dry_run_content_hash, apply_report, optional receipt_refresh_summary
    POST:
      - success => dry-run writes apply-{wave_scope}.v1.json under working/fleet-constraint-v2/waves/{client_id}/dry-run/
      - success => hash stable when sidecar bytes unchanged
      - success => apply captures before.bytes snapshots under dry-run/snapshots/ before header insert
      - success => legacy-v1 sidecars on list become header-only-v2 or constraint-ready-v2 per classify heuristic
      - success => receipts_refresh_flag refreshes G3 receipts for touched G3 wave
      - success => aggregate_migration_state refresh does NOT alone prove fleet-migrated-client
    FAILURE_MODES: hash_mismatch_on_apply, missing_dry_run_without_force, sidecar_outside_wave_list
    DATA_TRANSITION: sidecar bytes unchanged in dry-run; apply inserts v2 header from snapshot revert path
    EFFECTS: IO when apply_flag true — mutates client tied/implementation-decisions/*-pseudocode.md under repository_root
  LOAD sidecar_list FROM partition wave OR union stdd waves filtered to legacy-v1
  FOR each sidecar IN sidecar_list
    CLASSIFY migration state USING classifySidecarText
    IF legacy-v1 THEN plan insert_grammar_v2_header ELSE plan none
  EMIT apply-diff.v1.json WITH dry_run_content_hash
  IF apply_flag
    VERIFY dry_run_content_hash OR force_flag
    FOR each planned insert action
      WRITE snapshot bytes THEN insert Grammar-Version v2 header before first ## or procedure block
  IF receipts_refresh_flag
    CALL EMIT_G3_RECEIPT FOR each affected stdd G3 wave
  RETURN apply_diff_path, dry_run_content_hash, apply_report

procedure APPLY_CONSTRAINT_READY_ASSIST:
  # [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] How: Promote header-only-v2 sidecars toward constraint-ready-v2 with minimal Layer B procedure Contract stubs (TBD placeholders); classify inventory using v2 header plus procedure Contract floor or Tier-3 markers; dry-run hash gate before apply; no fleet-migrated-client claim.
  Contract:
    INPUT: wave_id OR all_waves_flag OR report_flag, repository_root, apply_flag, force_flag, receipts_refresh_flag
    PRE:
      - sidecar paths limited to fleet-wave-partition stdd wave sidecar_list_path entries when wave_id set
      - apply_flag false => no sidecar writes
      - apply_flag true => prior dry_run_content_hash matches recomputed hash OR force_flag true
    OUTPUT: constraint_ready_diff_path, dry_run_content_hash, apply_report, optional receipt_refresh_summary
    POST:
      - success => dry-run writes constraint-ready-{wave_scope}.v1.json under working/fleet-constraint-v2/waves/stdd/dry-run/
      - success => hash stable when sidecar bytes unchanged
      - success => apply captures before.bytes snapshots under dry-run/snapshots-constraint-ready/ before Contract stub insert
      - success => insert_minimal_procedure_contract adds Contract PRE/POST/EFFECTS TBD stub after procedure line only; flag_manual_contract_migration never auto-applies
      - success => classifySidecarText marks constraint-ready-v2 when v2 header and Layer B contract floor or Tier-3 markers
      - success => aggregate_migration_state refresh does NOT alone prove fleet-migrated-client
    FAILURE_MODES: hash_mismatch_on_apply, missing_dry_run_without_force, sidecar_outside_wave_list
    DATA_TRANSITION: sidecar bytes unchanged in dry-run; apply inserts minimal Contract stub from snapshot revert path
    EFFECTS: IO when apply_flag true — mutates tied/implementation-decisions/*-pseudocode.md under stdd repo only for insert actions
  IF report_flag
    SCAN all stdd project sidecars; EMIT counts by migration state and assist action type; RETURN
  LOAD sidecar_list FROM partition wave OR union stdd waves
  FOR each sidecar IN sidecar_list
    CLASSIFY migration state USING classifySidecarText with Layer B floor
    ANALYZE procedure blocks missing Contract with PRE POST EFFECTS
    IF gaps AND v2 header THEN plan insert_minimal_procedure_contract
    ELSE IF legacy INPUT comments without procedure THEN plan flag_manual_contract_migration
    ELSE plan none
  EMIT constraint-ready-diff.v1.json WITH dry_run_content_hash
  IF apply_flag
    VERIFY dry_run_content_hash OR force_flag
    FOR each insert_minimal_procedure_contract action
      WRITE snapshot bytes THEN insert minimal Contract stub after procedure line
  IF receipts_refresh_flag AND wave_id
    CALL EMIT_G3_RECEIPT FOR wave_id stdd G3 wave
  RETURN constraint_ready_diff_path, dry_run_content_hash, apply_report
