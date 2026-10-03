# [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Validate and persist canonical feature-local clarification records without treating generated markers as source data.
Contract:
  INPUT: feature_directory: string where length(feature_directory) > 0; candidate sidecar; expected_revision: int where expected_revision >= 0; actor: string where length(actor) > 0
  OUTPUT: normalized clarification sidecar or deterministic validation error
  DATA: clarifications.v1 envelope and clarification records
  PRE: feature directory is within the project feature root; actor is present
  POST: successful publication contains unique valid records and revision metadata
  EFFECTS: atomically replaces only the feature-local clarification sidecar
  FAILURE_MODES: invalid schema, duplicate id, unsafe path, stale revision, unauthorized resolution
  DATA_TRANSITION: candidate sidecar -> normalized persisted sidecar
  TERMINATION: total

procedure NORMALIZE_CLARIFICATION_SIDECAR(raw_sidecar):
  # [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — How: Normalize required fields and reject malformed canonical records before persistence.
  Contract:
    INPUT: raw_sidecar with records: list where length(records) >= 0
    PRE: raw sidecar is parseable
    OUTPUT: normalized sidecar | validation error
    POST: every record has required fields and valid enums
    EFFECTS: pure
    FAILURE_MODES: missing required field, duplicate id, invalid reference
    DATA_TRANSITION: raw record -> normalized record
    TERMINATION: total
  VALIDATE schema_version and feature identity
  VALIDATE unique id, question, affected_scope, blocking, owner, priority, and status
  REQUIRE decision, resolved_at, resolution_revision, and evidence or approval references for resolved records
  REJECT NEEDS_CLARIFICATION as a persisted record field
  RETURN normalized sidecar or validation error

procedure PUBLISH_CLARIFICATION_SIDECAR(normalized_sidecar, expected_revision):
  # [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — How: Publish a validated sidecar atomically and revision-safely.
  Contract:
    INPUT: normalized_sidecar; expected_revision: int where expected_revision >= 0
    PRE: expected revision matches current sidecar
    OUTPUT: next revision and persisted path
    POST: complete sidecar is visible or no change is visible
    EFFECTS: temporary file and atomic replacement
    FAILURE_MODES: stale revision, serialization failure, replacement failure
    DATA_TRANSITION: validated candidate -> published sidecar
    TERMINATION: total
  COMPARE expected revision with current sidecar revision
  SERIALIZE normalized data deterministically
  WRITE a temporary sibling file
  ATOMICALLY replace the sidecar
  RETURN incremented revision and persisted path
