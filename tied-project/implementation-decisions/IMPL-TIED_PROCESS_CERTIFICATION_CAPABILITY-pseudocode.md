# [IMPL-TIED_PROCESS_CERTIFICATION_CAPABILITY] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS] [REQ-TIED_PROCESS_CERTIFICATION_READINESS] — capability profiler

Grammar-Version: v2

procedure EVALUATE_CAPABILITY_PROFILE_V1:
  Contract:
    INPUT: processRecord EdseProcessRecordV1, capabilityModel Iso330xxCapabilityModelV1, options object
    PRE: options must not request aggregate_score, maturity_level, or rollup_percentage
    OUTPUT: capability-profile.v1 with seven dimension rows
    POST:
      - success => each dimension emitted independently with proof_boundary
      - failure => forbidden rollup option rejected
    EFFECTS: pure
    FAILURE_MODES: AGGREGATE_SCORE_FORBIDDEN
    TERMINATION: total
  IF options requests rollup THEN FAIL AGGREGATE_SCORE_FORBIDDEN
  FOR each dimension in model.dimensions ordered:
    EVALUATE evidence for dimension
    APPEND dimension result with limitations
  RETURN profile
