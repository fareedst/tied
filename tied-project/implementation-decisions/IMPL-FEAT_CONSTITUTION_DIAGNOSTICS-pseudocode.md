# [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Normalize compliance findings into deterministic pre-implementation diagnostics.
Contract:
  INPUT: findings: list where length(findings) >= 0
  OUTPUT: ordered diagnostics and readiness status
  DATA: artifact path, article id, code, severity, location, remediation
  PRE: findings use the analyzer contract
  POST: identical inputs produce identical output ordering
  EFFECTS: pure
  FAILURE_MODES: incomplete finding, conflicting exception state
  DATA_TRANSITION: findings -> diagnostics
  TERMINATION: total

procedure ORDER_CONSTITUTION_DIAGNOSTICS(findings):
  # [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — How: Make diagnostic ordering and blocker status stable.
  Contract:
    INPUT: findings: list where length(findings) >= 0
    PRE: each finding has artifact and article identity
    OUTPUT: sorted diagnostics and readiness status
    POST: failures cannot be hidden by views or CLI overrides
    EFFECTS: pure
    FAILURE_MODES: missing diagnostic identity
    DATA_TRANSITION: unsorted findings -> ordered diagnostics
    TERMINATION: total
  NORMALIZE each finding to artifact path, article id, diagnostic code, severity, location, and remediation
  SORT by artifact path, article id, diagnostic code, and stable location
  MARK required failures and expired exceptions as blocking
  IF any blocking diagnostic exists: RETURN pre-implementation failure status with ordered diagnostics
  RETURN ordered diagnostics and ready status
