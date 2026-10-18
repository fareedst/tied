# [IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] — context-profile.v1 validator

Grammar-Version: v2

procedure VALIDATE_CONTEXT_PROFILE_V1:
  Contract:
    INPUT: profile_document unknown
    PRE: profile_document is object
    OUTPUT: { valid: true, profile: ContextProfileV1 } | { error: validation_error }
    POST:
      - success => each dimension in allowed enum LOW|MEDIUM|HIGH|UNKNOWN
      - success => criticality UNKNOWN preserved (never coerced to LOW)
    FAILURE_MODES: validation_error
    EFFECTS: pure
    TERMINATION: total
  FOR each dimension in profile.dimensions:
    IF value not in enum THEN RETURN error(validation_error)
  RETURN { valid: true, profile: normalized }
