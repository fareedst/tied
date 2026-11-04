# [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY] [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY] [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]
# Static allowlist inventory for first-party process.env reads.

Grammar-Version: v2

## LOAD_ENV_ALLOWLIST
# [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY] [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY] [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] How: Parse committed tied-env-allowlist.v1.yaml; validate schema and entry keys.
procedure LOAD_ENV_ALLOWLIST(allowlistPath):
  Contract:
    INPUT: absolute allowlistPath to tied-env-allowlist.v1.yaml
    OUTPUT: allowlist document with scan_roots, scan_exclude_globs, entries[]
    PRE: allowlistPath is readable file
    POST: every entry has env_key, class, owner_req
    FAILURE_MODES: ALLOWLIST_SCHEMA_INVALID; ALLOWLIST_MISSING
    EFFECTS: read-only file IO
    TERMINATION: total
  READ and PARSE yaml at allowlistPath
  VALIDATE schema tied-env-allowlist.v1
  RETURN document

## COLLECT_ENV_READS_FROM_SOURCES
# [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY] [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY] [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] How: Walk scan_roots under storeRoot; skip scan_exclude_globs; regex extract process.env.IDENT references.
procedure COLLECT_ENV_READS_FROM_SOURCES(storeRoot, allowlistDoc):
  Contract:
    INPUT: storeRoot; allowlistDoc from LOAD_ENV_ALLOWLIST
    OUTPUT: map envKey -> list of { relativePath, lineHint }
    PRE: scan_roots non-empty
    POST: only files not matching exclude globs are scanned
    FAILURE_MODES: SCAN_ROOT_MISSING
    EFFECTS: read-only directory walk and file read
    TERMINATION: total bounded by file count under roots
  INITIALIZE empty map
  FOR each root in allowlistDoc.scan_roots
    WALK files under join(storeRoot, root) excluding globs
    FOR each file content
      EXTRACT identifiers matching process.env dot/bracket patterns
      APPEND occurrence to map
  RETURN map

## ASSERT_READS_ALLOWLISTED
# [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY] [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY] [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] How: Fail when any collected env key is absent from allowlist entries.
procedure ASSERT_READS_ALLOWLISTED(collectedReads, allowlistDoc):
  Contract:
    INPUT: collectedReads map; allowlistDoc
    OUTPUT: void on success | error report listing undocumented keys and locations
    PRE: allowlistDoc.entries non-empty
    POST: every key in collectedReads exists in allowlist env_key set
    FAILURE_MODES: UNDOCUMENTED_ENV_READ with file locations
    EFFECTS: none (pure check)
    TERMINATION: total
  BUILD allowlistedKeys from allowlistDoc.entries env_key
  FOR each key in collectedReads
    IF key NOT IN allowlistedKeys THEN FAIL with locations
  RETURN success

## RUN_ENV_ALLOWLIST_INVENTORY
# [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY] [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY] [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] How: Test and CI entry; resolve store root; load allowlist; collect reads; call ASSERT_READS_ALLOWLISTED.
procedure RUN_ENV_ALLOWLIST_INVENTORY(opts):
  Contract:
    INPUT: optional allowlistPath override; optional storeRoot override for fixtures
    OUTPUT: exit 0 or diagnostic failure payload
    PRE: default allowlist path exists under tools/bootstrap/fixtures/tied-env-allowlist/
    POST: ASSERT_READS_ALLOWLISTED passes for production scan
    FAILURE_MODES: UNDOCUMENTED_ENV_READ; ALLOWLIST_MISSING
    EFFECTS: read-only
    TERMINATION: total
  storeRoot := opts.storeRoot OR derive from module anchor to methodology store root
  allowlist := LOAD_ENV_ALLOWLIST(opts.allowlistPath OR default fixture path)
  reads := COLLECT_ENV_READS_FROM_SOURCES(storeRoot, allowlist)
  CALL ASSERT_READS_ALLOWLISTED(reads, allowlist)
  RETURN exit 0
