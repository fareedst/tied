# [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA]

## Summary contract
# [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: validate and normalize feature-manifest.v1 without mutating canonical TIED data.
Contract:
  INPUT: raw_manifest
  PRE: raw_manifest is a parseable mapping
  OUTPUT: normalized_manifest | validation_error
  POST: success returns reference-only fields; failure returns a stable category
  FAILURE_MODES: UNSUPPORTED_VERSION; INVALID_IDENTITY; EMBEDDED_CANONICAL_BODY; INVALID_REFERENCE_SHAPE
  EFFECTS: pure
  TERMINATION: total

## MANIFEST_SCHEMA_CONTRACT
# [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: enforce version, identity, mode, lifecycle, references, revision, and ownership.
procedure VALIDATE_MANIFEST(raw_manifest):
  Contract:
    INPUT: raw_manifest
    PRE: raw_manifest is parseable
    OUTPUT: normalized_manifest | validation_error
    POST: valid output contains no embedded canonical bodies
    FAILURE_MODES: UNSUPPORTED_VERSION; INVALID_IDENTITY; EMBEDDED_CANONICAL_BODY; INVALID_REFERENCE_SHAPE
    EFFECTS: pure
    TERMINATION: total
  CHECK schema_version equals feature-manifest.v1
  CHECK feature_id matches FEAT-NNN and slug is directory-safe
  CHECK mode and lifecycle are known values
  CHECK references contain tokens only
  REJECT embedded canonical record bodies
  RETURN NORMALIZE_MANIFEST(raw_manifest)

## NORMALIZE_MANIFEST
# [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: produce stable comparison data while preserving semantic values and ownership.
procedure NORMALIZE_MANIFEST(manifest):
  # [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: normalize accepted manifest data for deterministic comparison.
  Contract:
    INPUT: validated manifest
    PRE: VALIDATE_MANIFEST accepted the manifest
    OUTPUT: normalized_manifest
    POST: equal logical inputs produce equal normalized output
    EFFECTS: pure
    TERMINATION: total
  ORDER reference collections deterministically
  PRESERVE identity, revision, and lifecycle fields
  RETURN normalized manifest
