# [IMPL-FLEET_EXEMPLAR_REFINEMENT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
# Summary: Refinement annotation profile — typed INPUT/OUTPUT refinements under Grammar v2.

Grammar-Version: v2

## WAVE_SIZE_CHECK

- [IMPL-FLEET_EXEMPLAR_REFINEMENT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
- How: Ensure wave sidecar count within configured maximum before migration dry-run.

procedure WAVE_SIZE_CHECK:
  # [IMPL-FLEET_EXEMPLAR_REFINEMENT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
  # How: Compare count to max; return within_limit flag.
  Contract:
    INPUT: count: int where count >= 0
    OUTPUT: within_limit: boolean
    PRE: max_sidecars >= 1
    POST: count <= max_sidecars
    DATA: max_sidecars: int
    EFFECTS: pure
    TERMINATION: total
  within_limit := count <= max_sidecars
  RETURN within_limit
