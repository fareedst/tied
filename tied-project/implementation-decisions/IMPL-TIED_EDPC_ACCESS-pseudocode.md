# [IMPL-TIED_EDPC_ACCESS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] — fail-closed evidence access tier validation

Grammar-Version: v2

## Tier enum and capability matrix

procedure VALIDATE_EDPC_ACCESS_MATRIX:
  # [IMPL-TIED_EDPC_ACCESS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Reject unknown tiers and forbidden capability flags for the declared evidence_access_tier.
  Contract:
    INPUT: charter, access_matrix, tracker_edpc_engagement
    OUTPUT: ok_diagnostics
    PRE: access_matrix.evidence_access_tier is one of source_static, toolchain_readonly, source_change
    POST: when ok, no forbidden flag is true for the tier; production_touch allowed only when tier >= toolchain_readonly
    EFFECTS: pure
    FAILURE_MODES: unknown_tier; forbidden_capability; production_touch_requires_toolchain; path_mismatch
    TERMINATION: total
  CALL assertTierClosedSet(access_matrix.evidence_access_tier)
  CALL assertForbiddenFlagsForTier(access_matrix)
  CALL assertProductionTouchRules(access_matrix, tracker_edpc_engagement)
  CALL assertCharterMatrixPathsConsistent(charter, access_matrix, tracker_edpc_engagement)
  RETURN ok_diagnostics

procedure FORBIDDEN_FLAGS_FOR_TIER:
  # [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: source_static forbids compile, test, execute, source_write; toolchain_readonly forbids source_write only.
  Contract:
    INPUT: tier, capability_flags
    OUTPUT: violations
    PRE: tier known
    POST: violations empty when compliant
    EFFECTS: pure
    TERMINATION: total
  IF tier IS source_static THEN
    FOR EACH flag IN (compile, test, execute, source_write) DO
      IF capability_flags[flag] IS true THEN APPEND violation
  IF tier IS toolchain_readonly THEN
    IF capability_flags.source_write IS true THEN APPEND violation
  RETURN violations

procedure MCP_TIED_EDPC_ACCESS_VALIDATE:
  # [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP wrapper loads YAML paths from tracker edpc_engagement and runs VALIDATE_EDPC_ACCESS_MATRIX.
  Contract:
    INPUT: tracker, project_root
    OUTPUT: validation_result
    PRE: project_root absolute
    POST: validation_result.ok reflects matrix rules
    EFFECTS: read-only IO on charter and matrix paths
    FAILURE_MODES: missing_file; parse_error
    TERMINATION: total
  CALL loadYaml(charter_path)
  CALL loadYaml(access_matrix_path)
  CALL VALIDATE_EDPC_ACCESS_MATRIX
  RETURN validation_result
