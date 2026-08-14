# [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA]

## Summary contract
<!-- [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Own versioned constitution persistence at the canonical project path. -->
INPUT: project constitution candidate, expected version
OUTPUT: validated constitution or publication error
DATA: tied/constitution.yaml and version metadata
PRE: path is the project-owned constitution path
POST: only compatible validated versions publish
EFFECTS: atomically replaces the project constitution
FAILURE_MODES: wrong owner, invalid schema, incompatible amendment, stale version
DATA_TRANSITION: candidate constitution -> active constitution
TERMINATION: return result

## LOAD_CONSTITUTION
<!-- [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Load only the project-owned constitution and preserve version identity. -->
INPUT: project root
OUTPUT: constitution document
PRE: project root is resolved
POST: methodology and feature-local paths are rejected
EFFECTS: read only
FAILURE_MODES: missing file, unsafe path, parse failure
DATA_TRANSITION: file bytes -> structured constitution
TERMINATION: return document or error
1. Resolve exactly tied/constitution.yaml.
2. Parse and pass the document to the validator.

## PUBLISH_CONSTITUTION
<!-- [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Publish compatible constitution revisions atomically. -->
INPUT: validated candidate, expected version
OUTPUT: next constitution version
PRE: expected version matches active version
POST: complete candidate is active
EFFECTS: temporary file and atomic replacement
FAILURE_MODES: stale version or replacement failure
DATA_TRANSITION: validated candidate -> active revision
TERMINATION: return version
1. Verify amendment compatibility.
2. Write a deterministic temporary document.
3. Atomically replace tied/constitution.yaml.
