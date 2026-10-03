# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: serialize explicit request-key creation and return stable retry or collision outcomes.
Contract:
  INPUT: request_key: string where length(request_key) > 0; title: string where length(title) > 0; initial_references: list where length(initial_references) >= 0
  PRE: request_key is non-empty
  OUTPUT: created_feature | existing_feature | creation_error
  POST: matching retries return the original feature; mismatches never create a second feature; redelivery does not allocate twice (S-T01)
  FAILURE_MODES: REQUEST_KEY_REQUIRED; REQUEST_KEY_COLLISION; ALLOCATION_FAILED; PUBLISH_FAILED; LOCK_EXPIRED
  DATA: request-key index; feature manifest; lock expiry metadata
  DATA_TRANSITION: absent key→fingerprint and feature; matching key unchanged; mismatch unchanged; lock_expired → eligible_for_allocation
  EFFECTS: IO, State
  TERMINATION: total

## CREATE_FEATURE_IDEMPOTENTLY
procedure CREATE_FEATURE_IDEMPOTENTLY(request_key, title, initial_references):
  Contract:
    INPUT: request_key: string where length(request_key) > 0; title: string where length(title) > 0; initial_references: list where length(initial_references) >= 0
    PRE: request_key is non-empty
    OUTPUT: created_feature | existing_feature | creation_error
    POST: matching retries return the original feature; mismatches never create a second feature; unknown-outcome retry consults store before re-allocating (S-T04)
    FAILURE_MODES: REQUEST_KEY_REQUIRED; REQUEST_KEY_COLLISION; ALLOCATION_FAILED; PUBLISH_FAILED
    EFFECTS: IO, State
    TERMINATION: total

  # [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: lock the request key before lookup, allocation, and complete publication.
  IF request_key is empty: RETURN REQUEST_KEY_REQUIRED.
  Normalize title and references.
  Compute deterministic request fingerprint.
  Acquire exclusive lock for request_key with expiry metadata (see HANDLE_LOCK_TTL).
  Read request-key metadata from authoritative store.
  IF metadata exists AND fingerprint differs: RELEASE lock; RETURN REQUEST_KEY_COLLISION.
  IF metadata exists AND fingerprint matches:
    Read the recorded feature manifest.
    RELEASE lock.
    RETURN existing_feature without re-locking allocation (redelivery S-T01).
  IF in-progress reservation exists from unknown prior attempt:
    Consult store state — RETURN existing in-progress reference OR continue under same key (S-T04).
  Allocate a feature identifier under the same lock.
  Construct a draft feature manifest with the initial references.
  Publish the complete feature manifest.
  IF publication fails: remove the uncommitted request reservation; RELEASE lock; RETURN PUBLISH_FAILED.
  Persist request-key metadata after successful publication.
  RELEASE lock.
  RETURN created_feature.

## HANDLE_LOCK_TTL
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: expired locks release; metadata read before blocking; new allocation proceeds when prior lock invalid (S-T18).
Contract:
  INPUT: request_key: string where length(request_key) > 0; lock_record; now: timestamp
  PRE: lock record includes expiry; metadata read before blocking
  OUTPUT: lock_status | creation_error
  POST: after TTL, new allocation may proceed if metadata shows no committed feature; stale lock holders cannot block past TTL
  FAILURE_MODES: LOCK_HELD_VALID
  DATA_TRANSITION: lock_expired → eligible_for_allocation
  EFFECTS: IO, State
  TERMINATION: total
1. READ authoritative metadata for request_key
2. IF committed feature exists: RETURN existing_feature reference
3. IF lock_record.expiry <= now AND no committed feature: MARK lock expired; ALLOW allocation path
4. IF lock_record valid and unexpired: RETURN LOCK_HELD_VALID — block until release or TTL
5. RETURN lock_status

## VALIDATE_REQUEST_SCHEMA_VERSION
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: rollout skew yields deterministic version error — never silent dual fingerprint interpretation (S-T09).
Contract:
  INPUT: request_schema_version: int; expected_schema_version: int
  PRE: expected version configured
  OUTPUT: version_ok | creation_error
  POST: mismatch returns deterministic error without allocation
  FAILURE_MODES: SCHEMA_VERSION_MISMATCH; REQUEST_KEY_COLLISION
  EFFECTS: pure
  TERMINATION: total
1. IF request_schema_version != expected_schema_version: RETURN SCHEMA_VERSION_MISMATCH
2. RETURN version_ok

## ENFORCE_LOCK_FENCING
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: coordinator recovery requires fencing token match before allocation proceeds (S-T10 architecture_constraint).
Contract:
  INPUT: coordinator_epoch: int; lock_epoch: int; fencing_token: string optional
  PRE: lock service reports coordinator_epoch after recovery
  OUTPUT: fencing_ok | creation_error
  POST: stale lock epoch without valid fencing fails fast retryable; no dual winner
  FAILURE_MODES: LOCK_COORDINATOR_UNAVAILABLE; FENCING_TOKEN_STALE
  EFFECTS: IO
  TERMINATION: total
1. IF coordinator_epoch > lock_epoch AND fencing_token missing or stale: RETURN FENCING_TOKEN_STALE
2. IF lock coordinator unreachable: RETURN LOCK_COORDINATOR_UNAVAILABLE
3. RETURN fencing_ok

## APPLY_CREATE_PATH_BACKPRESSURE
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: shed load under create retry storm without breaking idempotency (S-T11 architecture_constraint).
Contract:
  INPUT: queue_depth: int; max_queue_depth: int; inflight_locks: int; max_inflight_locks: int
  PRE: limits configured
  OUTPUT: backpressure_decision
  POST: throttle is retryable; matching keys still return existing_feature
  EFFECTS: pure
  TERMINATION: total
1. IF queue_depth >= max_queue_depth OR inflight_locks >= max_inflight_locks: RETURN throttle_retryable
2. RETURN proceed

## EXPOSE_LOCK_HOLDER_OBSERVABILITY
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: expose lock holder identity and age; stale TTL emits explicit signal (S-O07).
Contract:
  INPUT: lock_record; now: timestamp
  PRE: lock_record includes holder_id and acquired_at_ms
  OUTPUT: lock_observability_view
  POST: expired locks include stale_lock=true for operators
  EFFECTS: pure
  TERMINATION: total
1. BUILD view with holder_id, age_ms, expires_at_ms
2. IF expires_at_ms <= now: SET stale_lock=true
3. RETURN lock_observability_view
