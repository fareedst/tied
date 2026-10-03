# [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS]

## Summary contract
<!-- [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Validate and persist canonical feature-local clarification records without treating generated markers as source data. -->
INPUT: feature directory, candidate sidecar, expected revision, actor
OUTPUT: normalized clarification sidecar or deterministic validation error
DATA: clarifications.v1 envelope and clarification records
PRE: feature directory is within the project feature root; actor is present
POST: successful publication contains unique valid records and revision metadata
EFFECTS: atomically replaces only the feature-local clarification sidecar
FAILURE_MODES: invalid schema, duplicate id, unsafe path, stale revision, unauthorized resolution
DATA_TRANSITION: candidate sidecar -> normalized persisted sidecar
TERMINATION: return success or one stable error category

## NORMALIZE_CLARIFICATION_SIDECAR
<!-- [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Normalize required fields and reject malformed canonical records before persistence. -->
INPUT: raw sidecar
OUTPUT: normalized sidecar
PRE: raw sidecar is parseable
POST: every record has required fields and valid enums
EFFECTS: none
FAILURE_MODES: missing required field, duplicate id, invalid reference
DATA_TRANSITION: raw record -> normalized record
TERMINATION: return normalized sidecar or validation error
1. Validate schema_version and feature identity.
2. Validate unique id, question, affected_scope, blocking, owner, priority, and status.
3. Require decision, resolved_at, resolution_revision, and evidence or approval references for resolved records.
4. Reject `[NEEDS_CLARIFICATION]` as a persisted record field.

## PUBLISH_CLARIFICATION_SIDECAR
<!-- [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Publish a validated sidecar atomically and revision-safely. -->
INPUT: normalized sidecar, expected revision
OUTPUT: next revision and persisted path
PRE: expected revision matches current sidecar
POST: complete sidecar is visible or no change is visible
EFFECTS: temporary file and atomic replacement
FAILURE_MODES: stale revision, serialization failure, replacement failure
DATA_TRANSITION: validated candidate -> published sidecar
TERMINATION: return publication result
1. Compare expected revision.
2. Serialize normalized data deterministically.
3. Write a temporary sibling.
4. Atomically replace the sidecar.
5. Return the incremented revision.
