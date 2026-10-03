# [IMPL-FLEET_EXEMPLAR_ALIAS] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
# Summary: Alias/mutation annotation profile — ALIAS POLICY on view/source binding.

Grammar-Version: v2

## RECEIPT_VIEW_BIND

- [IMPL-FLEET_EXEMPLAR_ALIAS] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
- How: Bind a read-only view over receipt bytes without mutating source buffer.

procedure RECEIPT_VIEW_BIND:
  # [IMPL-FLEET_EXEMPLAR_ALIAS] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
  # How: view aliases source; source remains immutable for analysis.
  Contract:
    INPUT: source: Buffer
    OUTPUT: view: Buffer
    PRE: length(source) > 0
    POST: true
    EFFECTS: pure
    TERMINATION: total
    ALIAS POLICY:
      - view may alias source
  view := source
  RETURN view
