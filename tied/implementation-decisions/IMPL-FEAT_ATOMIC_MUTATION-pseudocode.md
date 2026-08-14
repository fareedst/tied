# [IMPL-FEAT_ATOMIC_MUTATION] [ARCH-FEAT_REVISION_SAFE_MUTATION] [REQ-FEAT_REVISION_SAFE_MUTATION]

## Summary contract
# [IMPL-FEAT_ATOMIC_MUTATION] [ARCH-FEAT_REVISION_SAFE_MUTATION] [REQ-FEAT_REVISION_SAFE_MUTATION] — How: apply compare-and-swap revision checks and atomic manifest publication.
Contract:
  INPUT: feature_identifier; expected_revision; candidate_manifest
  PRE: candidate_manifest is validated and expected_revision is supplied for mutation
  OUTPUT: updated_manifest | mutation_error
  POST: success increments revision once and publishes a complete manifest; failure preserves the previous manifest
  FAILURE_MODES: FEATURE_NOT_FOUND; STALE_REVISION; VALIDATION_FAILED; SERIALIZATION_FAILED; PUBLISH_FAILED
  DATA: feature.yaml revision and lifecycle state
  DATA_TRANSITION: revision n→n+1 only on accepted publication; otherwise unchanged
  EFFECTS: IO, State
  TERMINATION: total

## APPLY_ATOMIC_MUTATION
# [IMPL-FEAT_ATOMIC_MUTATION] [ARCH-FEAT_REVISION_SAFE_MUTATION] [REQ-FEAT_REVISION_SAFE_MUTATION] — How: serialize mutation, compare revision, and publish with a same-directory atomic replacement.
procedure APPLY_ATOMIC_MUTATION(feature_identifier, expected_revision, candidate_manifest):
  # [IMPL-FEAT_ATOMIC_MUTATION] [ARCH-FEAT_REVISION_SAFE_MUTATION] [REQ-FEAT_REVISION_SAFE_MUTATION] — How: serialize mutation, compare revision, and publish with a same-directory atomic replacement.
  Acquire the feature mutation lock.
  Read the current manifest.
  IF current manifest is absent: RELEASE lock; RETURN FEATURE_NOT_FOUND.
  IF current revision differs from expected_revision: RELEASE lock; RETURN STALE_REVISION.
  Validate candidate_manifest with the Batch 0 manifest validator.
  IF validation fails: RELEASE lock; RETURN VALIDATION_FAILED.
  Set candidate revision to current revision plus one.
  Serialize candidate to a temporary file in the feature directory.
  Flush the temporary file.
  Atomically rename the temporary file to feature.yaml.
  ON error: remove only the temporary file; RELEASE lock; RETURN PUBLISH_FAILED.
  Derive next permitted phase from the resulting manifest.
  RELEASE lock.
  RETURN updated_manifest and next permitted phase.
