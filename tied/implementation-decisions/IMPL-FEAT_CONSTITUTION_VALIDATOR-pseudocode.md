# [IMPL-FEAT_CONSTITUTION_VALIDATOR] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA]

## Summary contract
<!-- [IMPL-FEAT_CONSTITUTION_VALIDATOR] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Validate constitution articles, exceptions, and amendments before publication. -->
INPUT: constitution document and active time
OUTPUT: normalized constitution or validation diagnostics
DATA: articles, scope, enforcement, exceptions, amendment history
PRE: document is parseable
POST: every active rule and exception satisfies the schema and ownership policy
EFFECTS: none
FAILURE_MODES: missing field, duplicate id, invalid exception, incompatible amendment
DATA_TRANSITION: raw constitution -> normalized constitution
TERMINATION: return normalized document or diagnostics

## VALIDATE_CONSTITUTION_DOCUMENT
<!-- [IMPL-FEAT_CONSTITUTION_VALIDATOR] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Enforce deterministic schema and semantic constraints. -->
INPUT: raw constitution
OUTPUT: normalized constitution
PRE: schema_version is present
POST: article and exception references resolve
EFFECTS: none
FAILURE_MODES: malformed article, unknown scope, duplicate identifier
DATA_TRANSITION: raw fields -> validated fields
TERMINATION: return result
1. Validate version, article ids, scope, enforcement, rationale, and amendment history.
2. Validate exception owner, rationale, approver, review status, and expiry.
3. Reject approved exceptions without required approval or expiry.
4. Check amendment compatibility against the active version.
