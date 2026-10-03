# [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — Analyze governed planning artifacts without mutating their canonical owners.
Contract:
  INPUT: validated_constitution; artifact_projections: list where length(artifact_projections) >= 0
  OUTPUT: compliance findings
  DATA: article rules, artifact scope, exception state
  PRE: constitution and artifact projections are validated
  POST: every in-scope rule yields a finding or explicit pass
  EFFECTS: pure
  FAILURE_MODES: unsupported artifact kind, invalid projection, expired exception
  DATA_TRANSITION: rules + artifacts -> findings
  TERMINATION: total

procedure ANALYZE_CONSTITUTION_COMPLIANCE(article, artifact):
  # [IMPL-FEAT_CONSTITUTION_ANALYZER] [ARCH-FEAT_CONSTITUTION_ANALYZER] [REQ-FEAT_CONSTITUTION_COMPLIANCE] — How: Evaluate rule scope and precedence before implementation.
  Contract:
    INPUT: article; artifact with kind: string where length(kind) > 0
    PRE: article scope intersects artifact kind
    OUTPUT: finding | pass
    POST: required failures remain visible unless a valid in-scope exception applies
    EFFECTS: pure
    FAILURE_MODES: invalid exception, unsupported rule
    DATA_TRANSITION: scoped article -> evaluated outcome
    TERMINATION: total
  MATCH the article to the artifact scope
  EVALUATE the rule
  APPLY precedence: required rule, valid approved exception, advisory rule
  EMIT explicit failure for expired, rejected, or unapproved exceptions
  RETURN finding or pass
