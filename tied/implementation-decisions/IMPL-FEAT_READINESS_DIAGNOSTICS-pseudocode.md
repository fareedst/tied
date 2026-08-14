# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS]

## Summary contract
# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — adapt readiness evidence into deterministic corrective diagnostics.
Contract:
  INPUT: feature_state, capability_state, readiness_evidence
  PRE: evidence is normalized or explicitly absent
  OUTPUT: readiness_report
  POST: report is deterministic, non-mutating, and names exact corrective commands
  FAILURE_MODES: INVALID_EVIDENCE, UNKNOWN_PREREQUISITE
  DATA: readiness evidence and diagnostic list
  EFFECTS: pure
  TERMINATION: total

## BUILD_READINESS_REPORT
# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — classify each unmet prerequisite using existing projections and preserve proof boundaries.
procedure BUILD_READINESS_REPORT(feature_state, capability_state, readiness_evidence):
  # [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — classify evidence into stable diagnostics.
  Collect missing capability, clarification, constitution, task, and view prerequisites.
  Map each prerequisite to its source evidence and affected lifecycle phase.
  Attach one exact corrective command or documented manual path.
  Sort diagnostics by phase, identity, severity, and command.
  Return report with ready, blocked, evidence, and proof-boundary fields.

## FORMAT_READINESS_DIAGNOSTIC
# [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — produce stable operator-facing fields without executing remediation.
procedure FORMAT_READINESS_DIAGNOSTIC(diagnostic):
  # [IMPL-FEAT_READINESS_DIAGNOSTICS] [ARCH-FEAT_READINESS_DIAGNOSTICS] [REQ-FEAT_READINESS_DIAGNOSTICS] — format without executing remediation.
  DATA_TRANSITION: diagnostic input remains unchanged; formatting returns a new report value.
  Return code, prerequisite, phase, evidence, corrective_command, and mutating=false.
