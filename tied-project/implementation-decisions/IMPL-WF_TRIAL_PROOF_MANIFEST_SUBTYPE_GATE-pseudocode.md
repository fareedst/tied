# [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [ARCH-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE]

Grammar-Version: v2

## PROOF_SUBTYPE_ROW_VALIDATOR

procedure proofSubtypeValidationError:
  # [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [ARCH-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] Centralize per-row proof_subtype checks; SC-PMG-11..12.
  Contract:
    INPUT: index (non-negative int), value (string or undefined), rowKind (files or bindings)
    PRE: rowKind is files or bindings
    OUTPUT: null on success OR error record with code and message
    POST:
      - on success: value is a member of VALID_PROOF_SUBTYPES
      - SUBTYPE_MISSING: empty or missing value
      - FACET_AS_SUBTYPE: value is unit, composition, e2e, or binding_inventory
      - UNKNOWN_SUBTYPE: value not in VALID_PROOF_SUBTYPES
    FAILURE_MODES: SUBTYPE_MISSING, FACET_AS_SUBTYPE, UNKNOWN_SUBTYPE
    EFFECTS: pure
    TERMINATION: total
  IF value missing or blank THEN RETURN SUBTYPE_MISSING with loc rowKind[index].proof_subtype
  IF value in COARSE_PROOF_FACETS THEN RETURN FACET_AS_SUBTYPE naming facet-vs-subtype and fine examples
  IF value not in VALID_PROOF_SUBTYPES THEN RETURN UNKNOWN_SUBTYPE with quoted value
  RETURN null

## MANIFEST_SUBTYPE_SHAPE_PASS

procedure manifestSubtypeValidationLoop:
  # [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [ARCH-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] [REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE] Loop all files and bindings in min-shape validation; SC-PMG-13 CLI DIAGNOSTIC hints after errors.
  Contract:
    INPUT: manifest object, cliMain boolean
    OUTPUT: errors[] appended
    PRE: manifest.files is non-empty array when shape gate runs files pass
    POST: each files[i] and optional bindings[i].proof_subtype checked; when cliMain and subtype errors, stderr gets taxonomy and MCP validate DIAGNOSTICs
    EFFECTS: pure for shape loop; IO stderr when diagnostics branch runs
    TERMINATION: total
  FOR each index i in manifest.files CALL proofSubtypeValidationError for row proof_subtype
  FOR each bindings row with proof_subtype CALL proofSubtypeValidationError with bindings loc
  IF cliMain AND errors contain subtype codes THEN WRITE taxonomy and MCP validate DIAGNOSTIC lines
