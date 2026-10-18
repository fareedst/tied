# [IMPL-TIED_PROCESS_CERTIFICATION_ADAPTIVE] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS] [REQ-TIED_PROCESS_CERTIFICATION_READINESS] — adaptive experiment

Grammar-Version: v2

procedure RUN_ADAPTIVE_EFFECTIVENESS_EXPERIMENT_V1:
  Contract:
    INPUT: fixtureRoot path, heldOutCaseIds set
    PRE: fixtureRoot contains perturbation cases and CASE receipt fixtures
    OUTPUT: adaptive-effectiveness-report.v1
    POST:
      - success => three arms fixed, rule_selected, adaptive each reported
      - success => held-out cases retain provenance
      - success => proof_boundary states observational_not_causal_superiority
    EFFECTS: read-only filesystem; pure selection replay
    FAILURE_MODES: UNDERPOWERED_ARM, HELD_OUT_PROVENANCE_MISSING
    TERMINATION: total when stop criteria met
  FOR each arm in [fixed, rule_selected, adaptive]:
    RUN cases with arm-specific selector
    RECORD selection receipt deltas under perturbation
  VERIFY held-out provenance preserved
  IF arm underpowered THEN FAIL UNDERPOWERED_ARM
  RETURN report with explicit proof_boundary
