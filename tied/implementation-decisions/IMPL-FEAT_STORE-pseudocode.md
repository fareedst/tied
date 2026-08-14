# [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE]

## Summary contract
# [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: persist and load one feature manifest beneath the feature store root without copying canonical TIED records.
Contract:
  INPUT: feature_directory; manifest?
  PRE: feature_directory is relative to the configured tied/features root
  OUTPUT: manifest | storage_error
  POST: successful write publishes one complete feature.yaml; failed write leaves the prior complete file unchanged
  FAILURE_MODES: INVALID_PATH; SERIALIZATION_FAILED; READ_FAILED; PUBLISH_FAILED
  DATA: tied/features/<feature-directory>/feature.yaml
  DATA_TRANSITION: absent→complete on create; complete_old→complete_new on replacement
  EFFECTS: IO, State
  TERMINATION: total

## RESOLVE_FEATURE_PATH
# [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: constrain feature paths to the configured feature store root.
procedure RESOLVE_FEATURE_PATH(feature_directory):
  # [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: constrain feature paths to the configured feature store root.
  Contract:
    INPUT: feature_directory
    PRE: feature_directory is non-empty and does not escape the store root
    OUTPUT: absolute_feature_path | INVALID_PATH
    POST: returned path is inside tied/features
    FAILURE_MODES: INVALID_PATH
    EFFECTS: pure
    TERMINATION: total
  Reject absolute paths and parent traversal.
  Join the configured root with feature_directory.
  RETURN joined path.

## READ_FEATURE_MANIFEST
# [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: read and parse the feature-local manifest as the orchestration source.
procedure READ_FEATURE_MANIFEST(feature_directory):
  # [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: read and parse the feature-local manifest as the orchestration source.
  Resolve feature path.
  IF path invalid: RETURN INVALID_PATH.
  Read feature.yaml.
  Parse manifest with the Batch 0 manifest validator.
  IF read or validation fails: RETURN READ_FAILED.
  RETURN manifest.

## PUBLISH_FEATURE_MANIFEST
# [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: publish a complete serialized manifest through the atomic mutation implementation.
procedure PUBLISH_FEATURE_MANIFEST(feature_directory, manifest):
  # [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: publish a complete serialized manifest through the atomic mutation implementation.
  Resolve feature path.
  Serialize manifest deterministically.
  Write serialized bytes to a temporary file in the same directory.
  Flush and atomically rename the temporary file to feature.yaml.
  ON error: remove only the temporary file and RETURN PUBLISH_FAILED.
  RETURN manifest.
