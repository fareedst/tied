# [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] — Shared relocation-aware pseudonymous project identity resolver.

## RESOLVE_PROJECT_IDENTITY

- [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] Resolve opaque project_id and identity_source from tied base path and optional env.
- PRE: tiedBasePath is a string (may be empty); env defaults to process.env when omitted.
- POST: Returns { project_id: 16-char hex string, identity_source: "configured" | "path_fallback" }; project_id never equals raw configured value or raw path.
- EFFECTS: Pure — no I/O.

```
READ configuredRaw FROM env.TIED_MCP_PROJECT_ID WHEN env provided ELSE process.env.TIED_MCP_PROJECT_ID
IF configuredRaw IS NOT null AND configuredRaw IS NOT undefined THEN
  # [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE]
  # Trim whitespace; valid configured IDs hash with SHA-256→16-hex for relocation-stable opaque output.
  trimmed := TRIM(configuredRaw)
  IF trimmed != "" AND IS_VALID_CONFIGURED_ID(trimmed) THEN
    RETURN { project_id: HASH_TO_PROJECT_ID(trimmed), identity_source: "configured" }
  ENDIF
ENDIF
# [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE]
# Path fallback preserves legacy path.resolve hash when env unset/empty/invalid; not relocation-stable.
RETURN { project_id: PATH_FALLBACK_PROJECT_ID(tiedBasePath), identity_source: "path_fallback" }
```

## IS_VALID_CONFIGURED_ID

- [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] Reject oversize, path-separator, and newline configured IDs so fallback applies without silent re-key.
- PRE: candidate is trimmed non-empty string under evaluation.
- POST: true only when length ≤ 128 and no `/`, `\`, CR, or LF characters.
- EFFECTS: Pure.

```
IF LENGTH(candidate) > 128 THEN RETURN false ENDIF
IF candidate CONTAINS "/" OR "\" OR CR OR LF THEN RETURN false ENDIF
RETURN true
```

## HASH_TO_PROJECT_ID

- [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE] Fixed-width opaque ID: SHA-256 digest first 16 hex chars (same algorithm as legacy path hash).
- PRE: input is non-empty string when used for configured path; any string for hash input.
- POST: Returns exactly 16 lowercase hex characters.
- EFFECTS: Pure.

```
RETURN SHA256(input).hex.slice(0, 16)
```

## PATH_FALLBACK_PROJECT_ID

- [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] Legacy compatibility: hash path.resolve(tiedBasePath || "unknown").
- PRE: tiedBasePath is string.
- POST: Deterministic 16-hex ID matching pre-slice-1 behavior for unchanged paths.
- EFFECTS: Pure.

```
resolved := path.resolve(tiedBasePath OR "unknown")
RETURN HASH_TO_PROJECT_ID(resolved)
```

## ANONYMIZED_PROJECT_ID (deprecated alias)

- [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] Backward-compatible export returning project_id only for legacy call sites.
- PRE: tiedBasePath string.
- POST: Same project_id as RESOLVE_PROJECT_IDENTITY(tiedBasePath).project_id.
- EFFECTS: Pure.

```
RETURN RESOLVE_PROJECT_IDENTITY(tiedBasePath).project_id
```
