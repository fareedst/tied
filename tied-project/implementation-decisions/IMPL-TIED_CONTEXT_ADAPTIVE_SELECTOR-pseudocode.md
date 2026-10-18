# [IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] — deterministic selector

Grammar-Version: v2

procedure SELECT_PRACTICES_DETERMINISTIC_V1:
  Contract:
    INPUT: library PracticeLibraryV1, profile ContextProfileV1, hard_constraints list
    PRE: library and profile validated
    OUTPUT: selection_receipt.v1
    POST:
      - success => receipt hash stable for identical inputs
      - success => hard_constraints applied before applicability rules
      - success => UNKNOWN criticality never treated as LOW in rule evaluation
    EFFECTS: pure
    TERMINATION: total
  DATA: selected_ids empty, rejected_ids empty, matched_rules empty
  APPLY hard_constraints first — reject violating practices
  FOR each contract in library.contracts ordered by id:
    IF prerequisites fail THEN reject with rule id
    IF incompatible with selected THEN reject with rule id
    IF applicability signals mismatch profile THEN reject
    ELSE append to selected_ids
  BUILD selection_receipt.v1 with context_hash, library_version, selected_ids, rejected_ids, matched_rules
  RETURN receipt
