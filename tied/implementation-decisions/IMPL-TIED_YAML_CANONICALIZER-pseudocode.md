# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# Summary: Canonicalize typed YAML through one deterministic profile, preserve opaque text, and expose format metadata across writers.

## Summary contract
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Define one typed serialization profile shared by MCP writers and compatibility frontends.
Contract:
  INPUT: parsed YAML value or one YAML file path; optional compatibility flags
  OUTPUT: canonical typed YAML text or atomic write result with yaml_format metadata
  DATA: maps, scalar values, lists, ordered-list key path, opaque block-scalar bodies, pseudo-code sidecar text
  CONTROL: profile id tied-yaml-canonical-v1; locale-independent lexical ordering; one file write at a time
  PRE: input is valid YAML when parsing is requested; target path is a regular project YAML file when writing
  POST: successful output is deterministic and typed; failed parse/serialize/write leaves the original target unchanged
  EFFECTS: pure for value canonicalization; File I/O for atomic writes; Exn for reported failures
  FAILURE_MODES: INVALID_YAML; UNSUPPORTED_VALUE; SERIALIZATION_FAILED; TEMP_WRITE_FAILED; ATOMIC_RENAME_FAILED
  DATA_TRANSITION: parsed value→canonical value→serialized text; target bytes unchanged on failure or replaced atomically on success
  TERMINATION: total — finite YAML tree traversal and finite file write

## CANONICALIZE_YAML_VALUE
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Recursively sort maps and eligible string lists while preserving scalar types, ordered-list order, object-list order, mixed-list order, and opaque text structure.
procedure CANONICALIZE_YAML_VALUE(value, path):
  PRE: value is a supported typed YAML value
  POST: map keys are locale-independent lexically ordered; eligible string lists are sorted; excluded structures retain order and values
  EFFECTS: pure
  FAILURE_MODES: UNSUPPORTED_VALUE
  TERMINATION: total
  IF value is a map:
    ordered := empty map
    FOR each key in locale-independent lexical order:
      ordered[key] := CANONICALIZE_YAML_VALUE(value[key], path + key)
    RETURN ordered
  IF value is a list:
    mapped := FOR each item IN value: CANONICALIZE_YAML_VALUE(item, path)
    IF every original element is a string AND path parent key is not an ordered-list key:
      RETURN locale-independent lexical sort(mapped)
    RETURN mapped
  IF value is a string, boolean, number, or null:
    RETURN value unchanged
  RETURN error UNSUPPORTED_VALUE

## IS_ORDERED_LIST_KEY
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Protect workflow order lists for exact key, prefix, suffix, and combined ordered-key naming patterns.
procedure IS_ORDERED_LIST_KEY(key):
  PRE: key is a string
  POST: returns true for order, order_*, *_order, and *_order_*; otherwise false
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  RETURN key equals "order" OR key matches "order_*" OR key matches "*_order" OR key matches "*_order_*"

## PRESERVE_OPAQUE_TEXT
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Exclude block-scalar bodies and IMPL pseudo-code sidecars from recursive semantic normalization; preserve their internal text structure.
procedure PRESERVE_OPAQUE_TEXT(text, artifact_kind):
  PRE: artifact_kind identifies a block-scalar body or IMPL pseudo-code sidecar
  POST: text is returned unchanged by recursive canonicalization and internal line ordering is preserved
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  IF artifact_kind is block_scalar OR artifact_kind is impl_pseudocode_sidecar:
    RETURN text unchanged
  RETURN text

## WRITE_CANONICAL_YAML_ATOMIC
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Parse, canonicalize, serialize, and atomically replace one YAML file only after every operation succeeds.
procedure WRITE_CANONICAL_YAML_ATOMIC(path, input):
  PRE: path is a writable project YAML target; input is valid or serializable typed YAML
  POST: path contains canonical output and original bytes remain intact after any failure
  EFFECTS: IO, Exn
  FAILURE_MODES: INVALID_YAML; SERIALIZATION_FAILED; TEMP_WRITE_FAILED; ATOMIC_RENAME_FAILED
  DATA_TRANSITION: original bytes→temporary canonical bytes→atomic replacement
  TERMINATION: total
  original := READ_BYTES(path)
  parsed := PARSE_TYPED_YAML(input)
  IF parsed fails: RETURN error INVALID_YAML
  canonical := CANONICALIZE_YAML_VALUE(parsed, root)
  serialized := SERIALIZE_TYPED_YAML(canonical, PRESERVE_OPAQUE_TEXT)
  IF serialization fails: RETURN error SERIALIZATION_FAILED
  temporary := WRITE_TEMPORARY(path, serialized)
  IF temporary fails: RETURN error TEMP_WRITE_FAILED
  IF ATOMIC_RENAME(temporary, path) fails:
    RESTORE original when replacement changed target
    RETURN error ATOMIC_RENAME_FAILED
  RETURN success with yaml_format := REPORT_YAML_FORMAT()

## REPORT_YAML_FORMAT
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Return stable metadata describing the canonical profile and its preservation boundaries.
procedure REPORT_YAML_FORMAT():
  PRE: profile constants are available
  POST: result has stable keys and values for clients and tests
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  RETURN {
    profile_id: "tied-yaml-canonical-v1",
    recursive_key_order: "locale-independent lexical",
    ordered_list_key_pattern: "order|order_*|*_order|*_order_*",
    string_list_rule: "sort all-string lists except ordered-list keys",
    scalar_policy: "preserve string, boolean, number, and null types",
    opaque_block_policy: "preserve block-scalar bodies and IMPL pseudo-code sidecars"
  }

## CANONICALIZE_YAML_FILE
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Route one YAML file through the shared atomic writer and return profile metadata; pseudo-code sidecars remain opaque text files.
procedure CANONICALIZE_YAML_FILE(path):
  PRE: path is a project YAML file and not an IMPL pseudo-code sidecar
  POST: successful write is canonical and reports yaml_format; failure preserves original bytes
  EFFECTS: IO, Exn
  FAILURE_MODES: INVALID_YAML; SERIALIZATION_FAILED; TEMP_WRITE_FAILED; ATOMIC_RENAME_FAILED
  TERMINATION: total
  IF path ends with "-pseudocode.md":
    RETURN success with opaque_sidecar := true
  RETURN WRITE_CANONICAL_YAML_ATOMIC(path, READ_BYTES(path))

## LINT_YAML_PATHS
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Process each compatibility path independently, preserving flags while delegating canonical semantics to the shared profile.
procedure LINT_YAML_PATHS(paths, compatibility_flags):
  PRE: paths is finite; each path is independently addressable
  POST: every path has an independent result; zero status means all canonical writes succeeded
  EFFECTS: IO, Exn
  FAILURE_MODES: INVALID_YAML; PATH_NOT_FOUND; WRITE_FAILED
  TERMINATION: total
  results := empty list
  FOR each path IN paths:
    results.append(CANONICALIZE_YAML_FILE(path))
  RETURN aggregate(results) with yaml_format := REPORT_YAML_FORMAT()

## MCP_WRITER_FORMAT_METADATA
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [REQ-MODULE_VALIDATION]
# How: Make index/detail/token/batch/CITDP/feedback/verification/rename writers return the same format metadata after shared canonical writes.
procedure MCP_WRITER_FORMAT_METADATA(write_operation):
  # [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [REQ-MODULE_VALIDATION]
  # How: Return one shared format contract from every successful MCP writer.
  PRE: write_operation delegates its YAML mutation to WRITE_CANONICAL_YAML_ATOMIC
  POST: successful response includes yaml_format; sidecars remain opaque and are never rewritten as YAML
  EFFECTS: IO, Exn
  FAILURE_MODES: propagate canonicalizer failures without partial response success
  TERMINATION: total
  result := AWAIT write_operation
  IF result failed: RETURN result error
  RETURN result plus yaml_format := REPORT_YAML_FORMAT()
