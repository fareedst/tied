# [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE]

## Summary contract
<!-- [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Analyze governed planning artifacts without mutating their canonical owners. -->
INPUT: validated constitution and REQ/ARCH/IMPL/task-plan/CITDP projections
OUTPUT: compliance findings
DATA: article rules, artifact scope, exception state
PRE: constitution and artifact projections are validated
POST: every in-scope rule yields a finding or explicit pass
EFFECTS: none
FAILURE_MODES: unsupported artifact kind, invalid projection, expired exception
DATA_TRANSITION: rules + artifacts -> findings
TERMINATION: return findings

## ANALYZE_CONSTITUTION_COMPLIANCE
<!-- [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Evaluate rule scope and precedence before implementation. -->
INPUT: article and artifact
OUTPUT: finding or pass
PRE: article scope intersects artifact kind
POST: required failures remain visible unless a valid in-scope exception applies
EFFECTS: none
FAILURE_MODES: invalid exception, unsupported rule
DATA_TRANSITION: scoped article -> evaluated outcome
TERMINATION: return outcome
1. Match the article to the artifact scope.
2. Evaluate the rule.
3. Apply precedence: required rule, valid approved exception, advisory rule.
4. Emit an explicit failure for expired, rejected, or unapproved exceptions.
