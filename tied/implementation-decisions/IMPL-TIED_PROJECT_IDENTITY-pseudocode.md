# [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] — Shared relocation-aware pseudonymous project identity resolver.


Grammar-Version: v2

## Summary contract
# [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] — Resolve opaque project_id and identity_source from tied base path and optional env.
Contract:
  INPUT: tiedBasePath, optional env
  OUTPUT: project_id and identity_source
  PRE: tiedBasePath is a string (may be empty); env defaults to process.env when omitted
  POST: project_id is 16-char hex; identity_source is configured or path_fallback; project_id never equals raw configured value or raw path
  EFFECTS: pure
  TERMINATION: total

procedure RESOLVE_PROJECT_IDENTITY(tiedBasePath, env):
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] — How: Resolve opaque project_id and identity_source from tied base path and optional env.
  Contract:
    INPUT: tiedBasePath, env
    PRE: tiedBasePath is string; env defaults to process.env when omitted
    OUTPUT: { project_id, identity_source }
    POST: project_id is 16-char hex; never equals raw configured value or raw path
    EFFECTS: pure
    TERMINATION: total
  READ configuredRaw FROM env.TIED_MCP_PROJECT_ID WHEN env provided ELSE process.env.TIED_MCP_PROJECT_ID
  IF configuredRaw IS NOT null AND configuredRaw IS NOT undefined THEN
    TRIM configuredRaw to trimmed
    IF trimmed is non-empty AND IS_VALID_CONFIGURED_ID(trimmed) THEN
      RETURN { project_id: HASH_TO_PROJECT_ID(trimmed), identity_source: "configured" }
  RETURN { project_id: PATH_FALLBACK_PROJECT_ID(tiedBasePath), identity_source: "path_fallback" }

procedure IS_VALID_CONFIGURED_ID(candidate):
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] — How: Reject oversize, path-separator, and newline configured IDs so fallback applies without silent re-key.
  Contract:
    INPUT: candidate: string where length(candidate) > 0
    PRE: candidate is trimmed non-empty string under evaluation
    OUTPUT: boolean
    POST: true only when length ≤ 128 and no slash, backslash, CR, or LF
    EFFECTS: pure
    TERMINATION: total
  IF LENGTH(candidate) > 128 THEN RETURN false
  IF candidate CONTAINS "/" OR "\" OR CR OR LF THEN RETURN false
  RETURN true

procedure HASH_TO_PROJECT_ID(input):
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] — How: Fixed-width opaque ID: SHA-256 digest first 16 hex chars (same algorithm as legacy path hash).
  Contract:
    INPUT: input
    PRE: input is non-empty string when used for configured path
    OUTPUT: 16 lowercase hex characters
    POST: digest is first 16 hex chars of SHA-256(input)
    EFFECTS: pure
    TERMINATION: total
  RETURN SHA256(input).hex.slice(0, 16)

procedure PATH_FALLBACK_PROJECT_ID(tiedBasePath):
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] — How: Legacy compatibility: hash path.resolve(tiedBasePath || "unknown").
  Contract:
    INPUT: tiedBasePath
    PRE: tiedBasePath is string
    OUTPUT: 16-char hex project_id
    POST: deterministic ID matching pre-slice-1 behavior for unchanged paths
    EFFECTS: pure
    TERMINATION: total
  resolved := path.resolve(tiedBasePath OR "unknown")
  RETURN HASH_TO_PROJECT_ID(resolved)

procedure ANONYMIZED_PROJECT_ID(tiedBasePath):
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] — How: Backward-compatible export returning project_id only for legacy call sites.
  Contract:
    INPUT: tiedBasePath
    PRE: tiedBasePath is string
    OUTPUT: project_id string
    POST: same project_id as RESOLVE_PROJECT_IDENTITY(tiedBasePath).project_id
    EFFECTS: pure
    TERMINATION: total
  RETURN RESOLVE_PROJECT_IDENTITY(tiedBasePath).project_id
