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

## MCP_RUNTIME_INTROSPECTION_SNAPSHOT
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: tied_config_get_base_path calls bootstrap resolver for disk store_root, mcp_dist_path, config_sources (SC-RDC-MCP-INTROSPECTION).

procedure MCP_RUNTIME_INTROSPECTION_SNAPSHOT(projectRoot, processEnv):
  Contract:
    INPUT: client project_root; MCP stdio processEnv from mcp.json
    OUTPUT: store_root, mcp_dist_path, config_sources, runtime_introspection_status
    PRE: projectRoot absolute
    POST: when status ok, paths match resolveTiedRuntimeConfig for same cwd/env
    FAILURE_MODES: unavailable when bootstrap module missing; error when resolver throws
    EFFECTS: read-only dynamic import of tools/bootstrap/lib/tied-runtime-config.mjs
    TERMINATION: total
  modulePath := locate bootstrap tied-runtime-config.mjs under TIED_STORE_ROOT or projectRoot
  IF modulePath missing THEN RETURN unavailable snapshot
  cfg := resolveTiedRuntimeConfig(cwd=projectRoot, mode=auto, processEnv)
  RETURN ok snapshot with cfg.storeRoot, cfg.mcpDistPath, cfg.sources

## LOAD_MERGED_OPERATOR_CONFIG
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Merge store.yaml operator section with gitignored operator.local.yaml overlay.

procedure LOAD_MERGED_OPERATOR_CONFIG(storeRoot):
  Contract:
    INPUT: storeRoot
    OUTPUT: operator record
    PRE: storeRoot path
    POST: local overlay keys override base operator map
    EFFECTS: read .tied/store.yaml merge and .tied/operator.local.yaml
    TERMINATION: total
  doc := LOAD_MERGED_STORE_YAML(storeRoot)
  operator := doc.operator or empty map
  IF operator.local.yaml exists THEN deepMerge operator with local file
  RETURN operator

## RESOLVE_OPERATOR_FLAGS_FOR_INSTALL
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Disk-first operator toggles for installMcpLayer; shell export ignored for catalogued keys when disk defines boolean.

procedure RESOLVE_OPERATOR_FLAGS_FOR_INSTALL(storeRoot, projectRoot, processEnv):
  Contract:
    INPUT: storeRoot; optional projectRoot; processEnv (not authoritative for defined disk booleans)
    OUTPUT: flags including collectMetrics
    PRE: storeRoot resolvable
    POST: collectMetrics from operator.mcp.collect_metrics when boolean; else brownfield mcp.json; else false
    EFFECTS: read store operator yaml only
    TERMINATION: total
  operator := LOAD_MERGED_OPERATOR_CONFIG(storeRoot)
  IF operator.mcp.collect_metrics is boolean THEN RETURN that value
  ELSE IF client mcp.json has TIED_MCP_COLLECT_METRICS=1 THEN RETURN true
  ELSE RETURN false

## MAP_OPERATOR_CONFIG_TO_MCP_ENV
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG]
# How: Map store operator booleans to mcp.json env keys; brownfield mcp.json when store omits key.

procedure MAP_OPERATOR_CONFIG_TO_MCP_ENV(operator, brownfieldEnv):
  Contract:
    INPUT: merged operator map; optional existing mcp env
    OUTPUT: set env keys and remove list for refresh
    PRE: operator is record
    POST: disk boolean true -> env "1"; false -> remove key; omit -> preserve brownfield when present
    EFFECTS: none
    TERMINATION: total
  FOR each catalogued bool field in operator.mcp, operator.agentstream, operator.jev.harness
    APPLY disk-first mapping to set/remove lists
  FOR each catalogued string field in operator.jev (decision_provider, local_bridge)
    IF non-empty string on disk THEN set env; IF empty string THEN remove; ELSE brownfield mcp.json
  RETURN set and remove

## APPLY_OPERATOR_TOGGLE_ENV_TO_MCP_ENTRY
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] [IMPL-TIED_FILES]
# How: refreshTiedMcpServersJson merges operator set/remove after path refresh.

procedure APPLY_OPERATOR_TOGGLE_ENV_TO_MCP_ENTRY(entry, operatorEnv, operatorEnvRemove):
  Contract:
    INPUT: mcp server entry; operator env set; remove keys
    OUTPUT: entry with merged env
    PRE: entry optional
    POST: remove keys deleted; set keys applied on tied-yaml and tied-yaml-optin
    EFFECTS: none
    TERMINATION: total
  MERGE env on entry

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

## RUNTIME_FIXTURE_CATALOG_PARITY
# [IMPL-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-FIXTURE-PARITY
# How: tools/bootstrap/fixtures/tied-runtime manifest materializes tmp workspaces; bootstrap + agentstream resolvers must match normalized snapshots.

procedure RUNTIME_FIXTURE_CATALOG_PARITY(manifestCase):
  Contract:
    INPUT: manifest case id under tools/bootstrap/fixtures/tied-runtime/
    OUTPUT: void
    PRE: case tagged for bootstrap and agentstream runtimes
    POST: normalize(resolve mjs) deep-equals normalize(resolve ts probe)
    EFFECTS: temp dirs only; read committed manifest
    TERMINATION: total
  tmp := MATERIALIZE_FIXTURE_CASE(manifestCase)
  mjs := RESOLVE_TIED_RUNTIME_CONFIG({ cwd: tmp.workspaceRoot, processEnv: tmp.processEnv })
  ts := RESOLVE_TIED_RUNTIME_CONFIG_FROM_WORKSPACE(tmp.workspaceRoot)
  ASSERT NORMALIZE_RESOLVE_SNAPSHOT(mjs) equals NORMALIZE_RESOLVE_SNAPSHOT(ts)
  CLEANUP tmp
