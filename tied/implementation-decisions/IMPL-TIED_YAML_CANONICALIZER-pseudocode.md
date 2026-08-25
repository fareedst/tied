# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# Summary: Canonicalize typed YAML through one deterministic profile, preserve opaque text, and expose format metadata across writers.

## Summary contract
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Define one typed serialization profile shared by MCP writers and compatibility frontends.
Contract:
  INPUT: parsed YAML value or one YAML file path; optional compatibility flags
  OUTPUT: canonical typed YAML text or atomic write result with yaml_format metadata
  DATA: maps, scalar values, lists, ordered-list key path, opaque block-scalar bodies, pseudo-code sidecar text
  CONTROL: profile id tied-yaml-canonical-v1; case-insensitive-primary locale-independent lexical ordering with original-value tie-break; one file write at a time
  PRE: input is valid YAML when parsing is requested; target path is a regular project YAML file when writing
  POST: successful output is deterministic and typed; failed parse/serialize/write leaves the original target unchanged
  EFFECTS: pure for value canonicalization; File I/O for atomic writes; Exn for reported failures
  FAILURE_MODES: INVALID_YAML; UNSUPPORTED_VALUE; SERIALIZATION_FAILED; TEMP_WRITE_FAILED; ATOMIC_RENAME_FAILED
  DATA_TRANSITION: parsed value→canonical value→serialized text; target bytes unchanged on failure or replaced atomically on success
  TERMINATION: total — finite YAML tree traversal and finite file write

## CANONICALIZE_YAML_VALUE
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Recursively sort maps and eligible string lists with case-insensitive-primary ordering and original-value lexical tie-breaking while preserving scalar types, ordered-list order, object-list order, mixed-list order, and opaque text structure.
procedure CANONICALIZE_YAML_VALUE(value, path):
  PRE: value is a supported typed YAML value
  POST: map keys and eligible string lists use case-insensitive-primary locale-independent lexical order with original-value tie-breaking; excluded structures retain order and values
  EFFECTS: pure
  FAILURE_MODES: UNSUPPORTED_VALUE
  TERMINATION: total
  IF value is a map:
    ordered := empty map
    FOR each key in canonical lexical order:
      ordered[key] := CANONICALIZE_YAML_VALUE(value[key], path + key)
    RETURN ordered
  IF value is a list:
    IF IS_ORDERED_LIST_KEY(path parent key):
      mapped := FOR each item IN value: CANONICALIZE_YAML_VALUE(item, path + index)
      RETURN mapped
    mapped := FOR each item IN value: CANONICALIZE_YAML_VALUE(item, path + index)
    recognition := RECOGNIZE_RECORD_LIST(path_parent_key, value)
    IF recognition:
      RETURN SORT_RECORD_LIST(mapped, recognition)
    IF every original element is a string:
      RETURN canonical lexical sort(mapped)
    RETURN SORT_HETEROGENEOUS_LIST(mapped, path_parent_key)

## RESOLVE_LIST_ITEM_TIER
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Classify each list item as tier 0 (strings, arrays, keyless maps) or tier 1 (maps with resolved registry or heuristic sort field).
procedure RESOLVE_LIST_ITEM_TIER(item, parent_key):
  PRE: item is a canonicalized list element
  POST: returns tier 0 or 1 and a canonical lexical sort key
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  IF item is string: RETURN { tier: 0, sort_key: item }
  IF item is array: RETURN { tier: 0, sort_key: canonical fingerprint(item) }
  IF item is mapping:
    sort_field := first configured registry field present on item when parent_key is registered
    IF sort_field missing AND parent_key unregistered:
      sort_field := lexicographically first string-valued key in item
    IF sort_field present:
      RETURN { tier: 1, sort_key: sort_field + "." + string value of sort_field }
    RETURN { tier: 0, sort_key: canonical fingerprint(item) }
  RETURN { tier: 0, sort_key: string(item) }

## SORT_HETEROGENEOUS_LIST
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Sort tier 0 items before tier 1 items; within each tier sort by canonical lexical sort key with fingerprint tie-break.
procedure SORT_HETEROGENEOUS_LIST(list_items, parent_key):
  PRE: list_items is array; parent_key is not an ordered-list key
  POST: tier 0 items precede tier 1 items; each tier sorted by COMPARE_CANONICAL_TEXT on sort key
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  tiered := FOR each item: RESOLVE_LIST_ITEM_TIER(item, parent_key)
  tier0 := stable_sort(items where tier == 0)
  tier1 := stable_sort(items where tier == 1)
  RETURN tier0 concatenated with tier1

## RECOGNIZE_RECORD_LIST
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Return registry entry with sort_field when parent key matches record-list registry and every item is a mapping with the configured stable field.
procedure RECOGNIZE_RECORD_LIST(parent_key, list_items):
  PRE: parent_key is string; list_items is array
  POST: returns registry entry with sort_field or nil when unrecognized or fail-safe
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  RECORD_LIST_REGISTRY := {
    satisfaction_criteria: [criterion],
    validation_criteria: [method],
    alternatives_considered: [name],
    files: [description, path],
    functions: [description, name],
    risks: [description, mitigation]
  }
  IF parent_key not in RECORD_LIST_REGISTRY: RETURN nil
  IF any item is not a mapping: RETURN nil
  FOR field IN RECORD_LIST_REGISTRY[parent_key]:
    IF every item has field: RETURN { sort_field: field, registry_key: parent_key }
  RETURN nil

## SORT_RECORD_LIST
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Sort complete mapping records by COMPARE_CANONICAL_TEXT on sort field; tie-break with original-value then canonical record fingerprint.
procedure SORT_RECORD_LIST(list_items, recognition):
  PRE: recognition from RECOGNIZE_RECORD_LIST; all items mappings with sort field
  POST: records sorted by COMPARE_CANONICAL_TEXT on sort field; ties broken original-value then canonical record fingerprint
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  mapped := FOR each item: CANONICALIZE_YAML_VALUE(item, path) preserving inner structure
  RETURN stable_sort(mapped, comparator using COMPARE_CANONICAL_TEXT on sort field, original-value tie-break, fingerprint tie-break)
  IF value is a string, boolean, number, or null:
    RETURN value unchanged
  RETURN error UNSUPPORTED_VALUE

## COMPARE_CANONICAL_TEXT
# [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
# How: Compare Unicode-lowercased values first, then original values as a deterministic case-sensitive tie-breaker.
procedure COMPARE_CANONICAL_TEXT(left, right):
  PRE: left and right are strings
  POST: returns a locale-independent ordering result
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  folded_left := Unicode-lowercase(left)
  folded_right := Unicode-lowercase(right)
  IF folded_left < folded_right:
    RETURN before
  IF folded_left > folded_right:
    RETURN after
  IF left < right:
    RETURN before
  IF left > right:
    RETURN after
  RETURN equal

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
    recursive_key_order: "case-insensitive-primary locale-independent lexical with original-value tie-break",
    ordered_list_key_pattern: "order|order_*|*_order|*_order_*|steps|steps_*|*_steps|*_steps_*",
    string_list_rule: "sort all-string lists except ordered-list keys",
    record_list_rule: "tier-0/tier-1 heterogeneous list sorting: strings/arrays/keyless maps before keyed maps; registry and heuristic map lists sort by fieldName.fieldValue; ordered-list keys preserve document order",
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
