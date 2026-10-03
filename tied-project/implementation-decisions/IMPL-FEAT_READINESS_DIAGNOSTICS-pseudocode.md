# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — adapt readiness evidence into deterministic corrective diagnostics.
Contract:
  INPUT: feature_state; capability_state; readiness_evidence with diagnostics: list where length(diagnostics) >= 0
  PRE: evidence is normalized or explicitly absent
  OUTPUT: readiness_report
  POST: report is deterministic, non-mutating, and names exact corrective commands
  FAILURE_MODES: INVALID_EVIDENCE, UNKNOWN_PREREQUISITE
  DATA: readiness evidence and diagnostic list
  EFFECTS: pure
  TERMINATION: total

## BUILD_READINESS_REPORT
procedure BUILD_READINESS_REPORT(feature_state, capability_state, readiness_evidence):
  Contract:
    INPUT: feature_state; capability_state; readiness_evidence with diagnostics: list where length(diagnostics) >= 0
    PRE: evidence is normalized or explicitly absent
    OUTPUT: readiness_report
    POST: report is deterministic, non-mutating, and names exact corrective commands
    FAILURE_MODES: INVALID_EVIDENCE; UNKNOWN_PREREQUISITE
    EFFECTS: pure
    TERMINATION: total

# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — classify each unmet prerequisite using existing projections and preserve proof boundaries.
  # [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — classify evidence into stable diagnostics.
  Collect missing capability, clarification, constitution, task, and view prerequisites.
  Map each prerequisite to its source evidence and affected lifecycle phase.
  Attach one exact corrective command or documented manual path.
  Sort diagnostics by phase, identity, severity, and command.
  Return report with ready, blocked, evidence, and proof-boundary fields.

## FORMAT_READINESS_DIAGNOSTIC
procedure FORMAT_READINESS_DIAGNOSTIC(diagnostic):
  Contract:
    INPUT: diagnostic with code: string where length(code) > 0
    PRE: diagnostic is normalized
    OUTPUT: formatted diagnostic record
    POST: output is stable and mutating=false
    FAILURE_MODES: INVALID_EVIDENCE
    DATA_TRANSITION: diagnostic input remains unchanged; formatting returns a new report value
    EFFECTS: pure
    TERMINATION: total

# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — produce stable operator-facing fields without executing remediation.
  # [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — format without executing remediation.
  Return code, prerequisite, phase, evidence, corrective_command, and mutating=false.
