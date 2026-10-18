# [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] — practice-contract.v1 loader and validator

Grammar-Version: v2

## Practice contract validation

- [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] How: closed schema checks before library load.

procedure VALIDATE_PRACTICE_CONTRACT_V1:
  Contract:
    INPUT: contract_document unknown
    PRE: contract_document is object
    OUTPUT: { valid: true, contract: PracticeContractV1 } | { error: validation_error }
    POST:
      - success => contract.schema_version equals practice-contract.v1
      - error => no partial contract returned
    FAILURE_MODES: validation_error
    EFFECTS: pure
    TERMINATION: total
  IF schema_version != practice-contract.v1 THEN RETURN error(validation_error)
  IF duplicate id in library batch THEN RETURN error(validation_error)
  IF compatibility edge references unknown id THEN RETURN error(validation_error)
  IF compatibility graph has cycle THEN RETURN error(validation_error)
  RETURN { valid: true, contract: normalized }

procedure LOAD_PRACTICE_LIBRARY_V1:
  Contract:
    INPUT: documents array
    PRE: documents non-empty
    OUTPUT: { library: PracticeLibraryV1 } | { error: validation_error }
    POST:
      - success => contracts sorted by id ascending deterministically
    EFFECTS: pure
    TERMINATION: total
  FOR each doc in documents:
    CALL VALIDATE_PRACTICE_CONTRACT_V1(doc)
  SORT contracts by id
  RETURN { library: { schema_version: practice-library.v1, contracts } }
