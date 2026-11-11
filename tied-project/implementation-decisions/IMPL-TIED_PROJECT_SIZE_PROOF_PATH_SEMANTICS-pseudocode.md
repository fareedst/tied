# [IMPL-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [ARCH-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS]

Grammar-Version: v2

## CLASSIFY_TEST_FILE_FINE

- [IMPL-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [ARCH-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] Derive proof_facet and proof_subtype from normalized relative path; L2 adds headers and label_case_counts.
procedure CLASSIFY_TEST_FILE_FINE:
  Contract:
    INPUT: relPath posix string
    OUTPUT: { facet, subtype }
    PRE: path under src test glob
    POST: facet maps to one of four receipt buckets; subtype from taxonomy enum
    EFFECTS: pure
  NORMALIZE slashes and lowercase
  IF binding-inventory in path THEN RETURN binding_inventory.table
  IF e2e signal THEN RETURN e2e.ui
  IF ends with .contract.test THEN RETURN composition.contract
  IF ends with .binding.test THEN RETURN composition.wiring
  IF ends with .integration.test THEN RETURN composition.integration
  IF composition substring or .composition.test THEN RETURN composition.general
  RETURN unit.default

procedure CLASSIFY_TEST_FILE_COARSE:
  Contract:
    INPUT: relPath
    OUTPUT: unit | composition | e2e | binding
    POST: composition suffixes roll to composition tier; validator_version remains 1.1.0 facet sums
    EFFECTS: pure
  DELEGATE fine classify for facet mapping
  MAP binding_inventory facet TO binding bucket key

procedure PARSE_PROOF_HEADERS:
  Contract:
    INPUT: source text
    OUTPUT: optional PROOF_LABEL and PROOF_KIND
    POST: L1 documents only; snapshot does not apply overrides until L2
    EFFECTS: pure
  MATCH first-line PROOF_LABEL and PROOF_KIND comment patterns
  RETURN parsed values or null
