# IMPL-TIED_AGENT_LOADER_REFRESH essence pseudocode

<!-- [IMPL-TIED_AGENT_LOADER_REFRESH] [ARCH-TIED_AGENT_LOADER_REFRESH] [REQ-TIED_AGENT_LOADER_REFRESH] -->

```
// [IMPL-TIED_AGENT_LOADER_REFRESH] [ARCH-TIED_AGENT_LOADER_REFRESH] [REQ-TIED_AGENT_LOADER_REFRESH]
// How: Semver-driven client AGENTS.md sync during db layer install.
PROCEDURE SYNC_AGENTS_MD(projectRoot, storeRoot, options)
  PRE: storeRoot reachable; store AGENTS template or store root AGENTS exists when store semver known
  POST: client AGENTS.md matches store template when client semver < store semver unless preserve flag
  EFFECTS: may overwrite install-managed AGENTS.md via copyFileWithAttributes
  FAILURE_MODES: MISSING_TEMPLATE_SOURCE when store semver known but template missing

  storeSemver := READ_STORE_METHODOLOGY_SEMVER(storeRoot)
  IF storeSemver == "unknown" THEN
    RETURN skipped store_semver_unknown
  ENDIF

  IF NOT EXISTS client AGENTS.md THEN
    COPY store template -> client AGENTS.md
    RETURN created
  ENDIF

  IF options.preserveAgentLoader THEN
    RETURN skipped preserve
  ENDIF

  clientSemver := READ_AGENTS_SEMVER(client AGENTS.md)
  IF clientSemver unparseable THEN
    COPY store template -> client AGENTS.md
    RETURN updated unparseable
  ENDIF

  cmp := COMPARE_SEMVER_TUPLE(clientSemver, storeSemver)
  IF cmp < 0 THEN COPY and RETURN updated client_behind_store
  IF cmp > 0 THEN WARN client_newer; RETURN skipped
  RETURN skipped equal
END PROCEDURE

// [IMPL-TIED_AGENT_LOADER_REFRESH] [ARCH-TIED_AGENT_LOADER_REFRESH] [REQ-TIED_AGENT_LOADER_REFRESH]
// How: Operator signal after manifest write when loader semver disagrees with install.json pin.
PROCEDURE WARN_AGENTS_LOADER_DRIFT(projectRoot)
  PRE: install.json may exist under tied-bundle/
  POST: sayWarn when AGENTS semver != store_methodology_version
  EFFECTS: none on disk
  pin := install.json store_methodology_version
  client := READ_AGENTS_SEMVER(AGENTS.md)
  IF pin valid AND client valid AND pin != client THEN WARN with refresh hint
END PROCEDURE
```
