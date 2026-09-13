# [IMPL-FLEET_EXEMPLAR_CONTRACT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
# Summary: Contract-only annotation profile — Layer B precision without Tier-3 rows.

Grammar-Version: v2

## INVENTORY_ROW_VALIDATE

- [IMPL-FLEET_EXEMPLAR_CONTRACT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
- How: Validate one client inventory row shape before wave assignment (illustrative).

procedure INVENTORY_ROW_VALIDATE:
  # [IMPL-FLEET_EXEMPLAR_CONTRACT] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
  # How: Reject rows missing client_id or methodology_pin.
  Contract:
    INPUT: row: InventoryRow
    OUTPUT: ok: boolean | { error: VALIDATION_ERROR }
    PRE: row is not null
    POST:
      - success => ok is true
      - error VALIDATION_ERROR => ok is false
    FAILURE_MODES: VALIDATION_ERROR — missing client_id or methodology_pin
    EFFECTS: pure
    TERMINATION: total
  IF row.client_id is empty OR row.methodology_pin is empty:
    RETURN { error: VALIDATION_ERROR }
  RETURN true
