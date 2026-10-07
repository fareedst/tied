# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-OBSERVATION-CAPTURE] [REQ-FEEDBACK_TO_TIED]
# Point-of-work observation capture with operator_local privacy, idempotency, and receipt (no transport).

Grammar-Version: v2

## Summary contract
INPUT: capture envelope or equivalent fields (title, description, privacy_tier, idempotency_key, optional observation kind and entry type)
PRE: privacy_tier is operator_local; title and description non-empty; idempotency_key non-empty
OUTPUT: capture receipt or structured error
POST: at most one entry per idempotency_key per base path; receipt excludes promotion and LEAP status fields
FAILURE_MODES: InvalidPrivacyTier, IncompletePayload, MalformedField, DuplicateAppendPrevented
DATA: feedback.yaml entries with additive idempotency_key, occurred_at, privacy_tier, context.capture
DATA_TRANSITION: append one entry or replay receipt for existing idempotency_key
EFFECTS: IO, State
TERMINATION: total

## FIND_ENTRY_BY_IDEMPOTENCY_KEY
# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [REQ-KAIZEN-OBSERVATION-CAPTURE] — Locates an existing entry by stable retry key before append.
Contract:
  INPUT: idempotency_key: string where length(trim(idempotency_key)) > 0; optional base path
  PRE: feedback store readable
  OUTPUT: FeedbackEntry | null
  POST: returns first matching entry or null; does not mutate store
  EFFECTS: IO read
  TERMINATION: total
  load entries from feedback.yaml
  scan for entry.idempotency_key equal to trimmed key
  RETURN matching entry or null

## CAPTURE_OPERATIONAL_OBSERVATION
# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [REQ-KAIZEN-OBSERVATION-CAPTURE] — Validates capture input, dedupes, appends additively, returns receipt.
Contract:
  INPUT: capture params including privacy_tier, title, description, idempotency_key, optional occurred_at, observation kind, entry_type, evidence refs
  PRE: privacy_tier is exactly operator_local
  OUTPUT: { ok: true, receipt } | { ok: false, error }
  POST: omitted entry_type persists methodology_improvement with context.capture.entry_type_omitted true; no kind-to-type inference
  FAILURE_MODES: InvalidPrivacyTier, IncompletePayload, MalformedField
  DATA_TRANSITION: append one entry or idempotent replay only
  EFFECTS: IO, State
  TERMINATION: total
  IF privacy_tier is not operator_local: RETURN error InvalidPrivacyTier
  validate non-empty title and description
  validate idempotency_key
  IF FIND_ENTRY_BY_IDEMPOTENCY_KEY returns entry: RETURN BUILD_CAPTURE_RECEIPT with idempotent_replay true
  validate optional entry_type against three enum values when present
  validate occurred_at ISO-8601 when present
  partition evidence refs into validated and rejected lists
  resolve persisted type: explicit entry_type OR methodology_improvement with entry_type_omitted flag
  build entry with additive fields and context.capture envelope subset
  atomic write via shared canonical writer
  RETURN BUILD_CAPTURE_RECEIPT for new entry with idempotent_replay false

## BUILD_CAPTURE_RECEIPT
# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [REQ-KAIZEN-OBSERVATION-CAPTURE] — Maps persisted entry to Phase 1 receipt JSON without promotion fields.
Contract:
  INPUT: FeedbackEntry, idempotent_replay flag, evidence ref partition lists
  PRE: entry has id and created_at
  OUTPUT: receipt object
  POST: notification_disposition is not_configured; no promotion_status or leap fields
  EFFECTS: pure
  TERMINATION: total
  map feedback_id, occurred_at, created_at, observation_kind echo or unknown, impact or unknown
  set idempotent_replay, duplicate_group, evidence_refs_validated, evidence_refs_rejected
  set notification_disposition not_configured
  RETURN receipt

## MCP_HANDLER_CAPTURE_OBSERVATION
# [IMPL-KAIZEN_OBSERVATION_CAPTURE] [REQ-KAIZEN-OBSERVATION-CAPTURE] — Thin MCP binding for tied_feedback_capture_observation.
Contract:
  INPUT: MCP args (event record or flat fields), optional base_path
  PRE: tool registered in tools index
  OUTPUT: JSON text content with ok and receipt or error
  POST: does not call tied_feedback_add; does not mutate project TIED YAML
  EFFECTS: IO via CAPTURE_OPERATIONAL_OBSERVATION
  TERMINATION: total
  normalize args to capture params
  CALL CAPTURE_OPERATIONAL_OBSERVATION
  RETURN JSON.stringify result
