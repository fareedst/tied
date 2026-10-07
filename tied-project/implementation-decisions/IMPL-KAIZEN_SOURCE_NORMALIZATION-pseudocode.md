# [IMPL-KAIZEN_SOURCE_NORMALIZATION] [ARCH-KAIZEN_SOURCE_NORMALIZATION] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-SOURCE-NORMALIZATION] [REQ-KAIZEN-OBSERVATION-CAPTURE] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]
# Shared observation kind and feedback entry type inference for capture and operational adapters.

Grammar-Version: v2

## Summary contract
INPUT: optional caller entry_type, optional observation kind, optional operational source_type and payload
PRE: when privacy tier is declared on adapter payload it must be operator_local
OUTPUT: resolved FeedbackType, default observation kind, or structured adapter error
POST: caller entry_type always wins; defect-like kinds map to bug_report; user_report friction is not feature_request by default
FAILURE_MODES: InvalidPrivacyTier, MissingOtherQualifier
EFFECTS: pure (inference helpers); IO only via callers
TERMINATION: total

## INFER_FEEDBACK_ENTRY_TYPE_FROM_KIND
# [IMPL-KAIZEN_SOURCE_NORMALIZATION] [REQ-KAIZEN-SOURCE-NORMALIZATION] — Maps closed observation kind to one of three feedback entry types.
Contract:
  INPUT: observation_kind string
  PRE: kind is non-empty when inferring
  OUTPUT: FeedbackType
  POST: defect, failed_test, deployment_failure, incident → bug_report; other known kinds → methodology_improvement
  EFFECTS: pure
  TERMINATION: total
  normalize kind to lowercase
  IF kind in defect-like set: RETURN bug_report
  RETURN methodology_improvement

## RESOLVE_FEEDBACK_ENTRY_TYPE
# [IMPL-KAIZEN_SOURCE_NORMALIZATION] [REQ-KAIZEN-SOURCE-NORMALIZATION] — Caller type wins; else infer from kind; else methodology_improvement.
Contract:
  INPUT: optional callerEntryType, optional observationKind
  OUTPUT: { entryType, entryTypeOmitted }
  POST: entryTypeOmitted false when caller supplied type
  EFFECTS: pure
  TERMINATION: total
  IF callerEntryType present: RETURN caller type with entryTypeOmitted false
  IF observationKind absent: RETURN methodology_improvement with entryTypeOmitted true
  RETURN infer from kind with entryTypeOmitted true

## NORMALIZE_OPERATIONAL_SOURCE (consumer)
# [IMPL-TIED_FEEDBACK_PROMOTION] [IMPL-KAIZEN_SOURCE_NORMALIZATION] — Operational adapter uses shared inference and preserves provenance.
Contract:
  INPUT: OperationalSource
  PRE: required source identity and evidence fields valid
  OUTPUT: OperationalFeedbackEntry or error
  POST: observation_kind and additive workflow/workaround/baseline_ref on context; provenance fields unchanged
  FAILURE_MODES: InvalidSource, MissingEvidence, InvalidPrivacyTier, MissingOtherQualifier
  EFFECTS: pure transform
  TERMINATION: total
  validate source shape and evidence
  reject non-operator_local privacy when declared
  resolve observation kind from payload or source_type default
  validate other_qualifier when kind is other
  resolve entry type via RESOLVE_FEEDBACK_ENTRY_TYPE
  merge additive context without overwriting title or description
  RETURN entry

## CAPTURE_OPERATIONAL_OBSERVATION (consumer)
# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [IMPL-KAIZEN_SOURCE_NORMALIZATION] — Capture path uses RESOLVE_FEEDBACK_ENTRY_TYPE when entry_type omitted.
Contract:
  INPUT: capture params
  PRE: Phase 1 privacy and idempotency rules unchanged
  OUTPUT: capture result
  POST: kind-only capture infers entry type; explicit entry_type wins
  EFFECTS: IO via existing capture write path
  TERMINATION: total
  after idempotency and validation CALL RESOLVE_FEEDBACK_ENTRY_TYPE
  persist entry with resolved type and capture envelope flags
