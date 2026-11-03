# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# On-disk store yaml + client mcp.json runtime resolution; install refresh writers.

Grammar-Version: v2

## RESOLVE_RUNTIME_FROM_MCP_ENTRY
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: Client global paths from tied-yaml mcp.json args[0] and env; shell path env ignored.

procedure RESOLVE_RUNTIME_FROM_MCP_ENTRY(projectRoot, mcpEntry, opts):
  Contract:
    INPUT: absolute projectRoot; parsed mcpServers.tied-yaml entry + env; optional requireDistExists
    OUTPUT: runtime record (storeRoot, mcpDistPath, clientProjectPath, clientBundlePath, sources)
    PRE: mcpEntry.env includes client project path; args[0] non-empty
    POST: mcpDistPath under storeRoot; clientProjectPath passes VALIDATE_TIED_PROJECT_LAYOUT
    FAILURE_MODES: RUNTIME_DIAGNOSTIC_MISSING; RUNTIME_CONFIG_MISMATCH; PATH_ESCAPE
    EFFECTS: read-only JSON and filesystem sentinels
    TERMINATION: total
  mcpDistPath := resolve args[0] absolute against projectRoot
  storeRoot := TIED_STORE_ROOT env or deriveStoreRootFromMcpDist(mcpDistPath)
  ASSERT mcpDistPath under storeRoot
  clientProjectPath := VALIDATE_TIED_PROJECT_LAYOUT(pickClientProjectPath(env))
  IF store yaml exists under storeRoot THEN append source store:.tied/store.yaml
  RETURN runtime record

## RESOLVE_RUNTIME_FROM_STORE_YAML
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Store checkout resolves from merged .tied/store.yaml + store.local.yaml.

procedure RESOLVE_RUNTIME_FROM_STORE_YAML(storeRoot, opts):
  Contract:
    INPUT: storeRoot; optional requireDistExists
    OUTPUT: runtime record for store mode
    PRE: .tied/store.yaml exists
    POST: mcp_server.dist resolves to absolute dist under store_root
    FAILURE_MODES: RUNTIME_DIAGNOSTIC_MISSING; invalid yaml
    EFFECTS: read yaml files only
    TERMINATION: total
  doc := merge store.yaml with store.local.yaml overlay
  mcpDistPath := resolve mcp_server.dist relative to doc.store_root or storeRoot
  RETURN runtime record with sources including store yaml paths

## LOAD_MERGED_STORE_YAML
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Base store.yaml merged with local overlay for operator refresh fields.

procedure LOAD_MERGED_STORE_YAML(storeRoot):
  Contract:
    INPUT: storeRoot
    OUTPUT: merged document object
    PRE: storeRoot writable path
    POST: local overlay keys override base when both present
    EFFECTS: read .tied/store.yaml and optional store.local.yaml
    TERMINATION: total
  RETURN merged yaml document

## REFRESH_STORE_RUNTIME_CONFIG
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_LAYERED_CLIENT_INSTALL]
# How: MCP install layer writes/updates store.local.yaml and normalizes store.yaml template.

procedure REFRESH_STORE_RUNTIME_CONFIG(storeRoot, options):
  Contract:
    INPUT: storeRoot; mcpDistPath; optional templatePath
    OUTPUT: void
    PRE: storeRoot is store checkout
    POST: .tied/store.local.yaml contains refreshed mcp_server.dist and paths; store.yaml present from template when missing
    EFFECTS: write .tied/*.yaml under storeRoot
    FAILURE_MODES: template missing; path escape
    TERMINATION: total
  WRITE or UPDATE store.local.yaml with resolved dist and store_root
  ENSURE committed store.yaml template when absent

## RESOLVE_RUNTIME_FOR_CWD
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Unified entry — try mcp.json surfaces first, else walk for store yaml; ignore shell global path env.

procedure RESOLVE_RUNTIME_FOR_CWD(cwd, processEnv, opts):
  Contract:
    INPUT: cwd; processEnv (ignored for TIED_MCP_BIN, TIED_REPO_ROOT, TIED_STORE_ROOT authority)
    OUTPUT: runtime record
    PRE: cwd exists
    POST: paths from install-managed surfaces only
    FAILURE_MODES: RUNTIME_DIAGNOSTIC_MISSING (fail closed before MCP spawn)
    EFFECTS: read config files under resolved roots
    TERMINATION: total
  projectRoot := RESOLVE_PROJECT_ROOT_FROM_CWD(cwd)
  mcp := READ_TIED_YAML_SERVER_ENTRY(projectRoot)
  IF mcp present THEN RETURN RESOLVE_RUNTIME_FROM_MCP_ENTRY(projectRoot, mcp, opts)
  storeRoot := FIND_STORE_ROOT_WITH_TIED_CONFIG(cwd)
  IF storeRoot THEN RETURN RESOLVE_RUNTIME_FROM_STORE_YAML(storeRoot, opts)
  THROW RUNTIME_DIAGNOSTIC_MISSING

## INSTALL_MCP_LAYER_RUNTIME_REFRESH
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] [IMPL-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
# How: installMcpLayer delegates store-side refresh to REFRESH_STORE_RUNTIME_CONFIG and client mcp.json env.

procedure INSTALL_MCP_LAYER_RUNTIME_REFRESH(projectRoot, options):
  # [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] How: installMcpLayer store refresh and client mcp.json env.
  Contract:
    INPUT: projectRoot; storeRoot; harness profile
    OUTPUT: void
    PRE: store reachable
    POST: client .cursor/mcp.json env paths updated; store .tied local overlay updated on store refresh
    EFFECTS: write mcp json and store yaml
    TERMINATION: total
  CALL refresh client mcp paths from store layout
  WHEN projectRoot equals storeRoot THEN CALL REFRESH_STORE_RUNTIME_CONFIG(storeRoot, dist from build)
