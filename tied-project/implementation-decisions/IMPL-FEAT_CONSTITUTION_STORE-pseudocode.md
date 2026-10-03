# [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — Own versioned constitution persistence at the canonical project path.
Contract:
  INPUT: validated_candidate; expected_version: int where expected_version >= 0
  OUTPUT: validated constitution or publication error
  DATA: tied/constitution.yaml and version metadata
  PRE: path is the project-owned constitution path
  POST: only compatible validated versions publish
  EFFECTS: atomically replaces the project constitution
  FAILURE_MODES: wrong owner, invalid schema, incompatible amendment, stale version
  DATA_TRANSITION: candidate constitution -> active constitution
  TERMINATION: total

procedure LOAD_CONSTITUTION(project_root):
  # [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — How: Load only the project-owned constitution and preserve version identity.
  Contract:
    INPUT: project_root: string where length(project_root) > 0
    PRE: project root is resolved
    OUTPUT: constitution document | error
    POST: methodology and feature-local paths are rejected
    EFFECTS: read only
    FAILURE_MODES: missing file, unsafe path, parse failure
    DATA_TRANSITION: file bytes -> structured constitution
    TERMINATION: total
  RESOLVE exactly tied/constitution.yaml under project_root
  PARSE document and pass to the validator
  RETURN constitution document or error

procedure PUBLISH_CONSTITUTION(validated_candidate, expected_version):
  # [IMPL-FEAT_CONSTITUTION_STORE] [ARCH-FEAT_CONSTITUTION_STORAGE] [REQ-FEAT_CONSTITUTION_SCHEMA] — How: Publish compatible constitution revisions atomically.
  Contract:
    INPUT: validated_candidate; expected_version: int where expected_version >= 0
    PRE: expected version matches active version
    OUTPUT: next constitution version
    POST: complete candidate is active
    EFFECTS: temporary file and atomic replacement
    FAILURE_MODES: stale version, replacement failure
    DATA_TRANSITION: validated candidate -> active revision
    TERMINATION: total
  VERIFY amendment compatibility
  WRITE deterministic temporary document
  ATOMICALLY replace tied/constitution.yaml
  RETURN next constitution version
