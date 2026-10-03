# [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE]

## Summary contract
<!-- [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Normalize compliance findings into deterministic pre-implementation diagnostics. -->
INPUT: analyzer findings
OUTPUT: ordered diagnostics and readiness status
DATA: artifact path, article id, code, severity, location, remediation
PRE: findings use the analyzer contract
POST: identical inputs produce identical output ordering
EFFECTS: none
FAILURE_MODES: incomplete finding, conflicting exception state
DATA_TRANSITION: findings -> diagnostics
TERMINATION: return diagnostics

## ORDER_CONSTITUTION_DIAGNOSTICS
<!-- [IMPL-FEAT_CONSTITUTION_DIAGNOSTICS] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Make diagnostic ordering and blocker status stable. -->
INPUT: findings
OUTPUT: sorted diagnostics
PRE: each finding has artifact and article identity
POST: failures cannot be hidden by views or CLI overrides
EFFECTS: none
FAILURE_MODES: missing diagnostic identity
DATA_TRANSITION: unsorted findings -> ordered diagnostics
TERMINATION: return ordered output
1. Normalize each finding to artifact path, article id, diagnostic code, severity, location, and remediation.
2. Sort by artifact path, article id, diagnostic code, and stable location.
3. Mark required failures and expired exceptions as blocking.
4. Return pre-implementation failure status when any blocking diagnostic exists.
