# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION]

## Summary contract
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: serialize explicit request-key creation and return stable retry or collision outcomes.
Contract:
  INPUT: request_key; title; initial_references
  PRE: request_key is non-empty
  OUTPUT: created_feature | existing_feature | creation_error
  POST: matching retries return the original feature; mismatches never create a second feature
  FAILURE_MODES: REQUEST_KEY_REQUIRED; REQUEST_KEY_COLLISION; ALLOCATION_FAILED; PUBLISH_FAILED
  DATA: request-key index; feature manifest
  DATA_TRANSITION: absent key→fingerprint and feature; matching key unchanged; mismatch unchanged
  EFFECTS: IO, State
  TERMINATION: total

## CREATE_FEATURE_IDEMPOTENTLY
# [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: lock the request key before lookup, allocation, and complete publication.
procedure CREATE_FEATURE_IDEMPOTENTLY(request_key, title, initial_references):
  # [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: lock the request key before lookup, allocation, and complete publication.
  IF request_key is empty: RETURN REQUEST_KEY_REQUIRED.
  Normalize title and references.
  Compute deterministic request fingerprint.
  Acquire exclusive lock for request_key.
  Read request-key metadata.
  IF metadata exists AND fingerprint differs: RELEASE lock; RETURN REQUEST_KEY_COLLISION.
  IF metadata exists AND fingerprint matches:
    Read the recorded feature manifest.
    RELEASE lock.
    RETURN existing_feature.
  Allocate a feature identifier under the same lock.
  Construct a draft feature manifest with the initial references.
  Publish the complete feature manifest.
  IF publication fails: remove the uncommitted request reservation; RELEASE lock; RETURN PUBLISH_FAILED.
  Persist request-key metadata after successful publication.
  RELEASE lock.
  RETURN created_feature.
