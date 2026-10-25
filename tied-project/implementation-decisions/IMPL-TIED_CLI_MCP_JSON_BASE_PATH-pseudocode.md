# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# CLI env from install-managed mcp.json before MCP stdio spawn.

Grammar-Version: v2

## RESOLVE_TIED_CLI_ENV
# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: tied-cli.sh / tied.sh / feature-orchestrator.sh entry — resolve env before MCP spawn.

procedure RESOLVE_TIED_CLI_ENV(cwd, processEnv):
  # [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] How: env override or mcp.json read then layout validate.
  Contract:
    INPUT: cwd, processEnv
    OUTPUT: { TIED_BASE_PATH, optional TIED_METHODOLOGY_BUNDLE_PATH } | { error: FAIL_CLOSED_MISSING_MCP | LAYOUT_INVALID }
    PRE: cwd exists
    POST: on success TIED_BASE_PATH passes VALIDATE_TIED_PROJECT_LAYOUT
    FAILURE_MODES: FAIL_CLOSED_MISSING_MCP, LAYOUT_INVALID
    EFFECTS: read-only JSON under project_root mcp files
    TERMINATION: total
  IF processEnv.TIED_BASE_PATH is non-empty THEN
    basePath := normalize(processEnv.TIED_BASE_PATH)
    VALIDATE_TIED_PROJECT_LAYOUT(basePath)
    RETURN { TIED_BASE_PATH: basePath, ...bundle from processEnv when set }
  projectRoot := RESOLVE_PROJECT_ROOT_FROM_CWD(cwd)
  mcpEnv := READ_TIED_YAML_ENV_FROM_PROJECT_MCP(projectRoot)
  IF missing(mcpEnv.TIED_BASE_PATH) THEN
    RETURN FAIL_CLOSED_MISSING_MCP(projectRoot)
  basePath := normalize(mcpEnv.TIED_BASE_PATH)
  VALIDATE_TIED_PROJECT_LAYOUT(basePath)
  RETURN subset(mcpEnv, TIED_BASE_PATH, TIED_METHODOLOGY_BUNDLE_PATH)

## RESOLVE_PROJECT_ROOT_FROM_CWD
# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: git toplevel first, else walk-up for mcp sentinel files.

procedure RESOLVE_PROJECT_ROOT_FROM_CWD(cwd):
  # [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] How: prefer git rev-parse --show-toplevel.
  Contract:
    INPUT: cwd
    OUTPUT: absolute project_root
    PRE: cwd exists
    POST: path is git toplevel OR ancestor containing .cursor/mcp.json or .mcp.json OR absolute(cwd) fallback
    EFFECTS: optional git subprocess
    TERMINATION: total
  IF git rev-parse --show-toplevel succeeds from cwd THEN
    RETURN git_toplevel
  dir := absolute(cwd)
  WHILE dir is not filesystem root DO
    IF exists(dir/.cursor/mcp.json) OR exists(dir/.mcp.json) THEN
      RETURN dir
    dir := parent(dir)
  RETURN absolute(cwd)

## READ_TIED_YAML_ENV_FROM_PROJECT_MCP
# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: read .cursor/mcp.json then .mcp.json; Cursor file wins when both define TIED_BASE_PATH.

procedure READ_TIED_YAML_ENV_FROM_PROJECT_MCP(projectRoot):
  # [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] How: mirror store.mjs file order.
  Contract:
    INPUT: projectRoot
    OUTPUT: tied-yaml env object (possibly empty)
    PRE: projectRoot exists
    POST: non-empty output includes TIED_BASE_PATH from first matching file in read order
    EFFECTS: read JSON files
    TERMINATION: total
  FOR rel IN [".cursor/mcp.json", ".mcp.json"] DO
    path := join(projectRoot, rel)
    IF NOT exists(path) THEN CONTINUE
    cfg := parse_json(path) OR CONTINUE on parse error
    env := cfg.mcpServers["tied-yaml"].env
    IF env.TIED_BASE_PATH is non-empty string THEN
      RETURN env
  RETURN {}

## VALIDATE_TIED_PROJECT_LAYOUT
# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: TIED_BASE_PATH must point at tied-project/ (requirements.yaml sentinel).

procedure VALIDATE_TIED_PROJECT_LAYOUT(basePath):
  # [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] How: requirements.yaml under basePath.
  Contract:
    INPUT: absolute basePath (tied-project/ root)
    OUTPUT: void | { error: LAYOUT_INVALID }
    PRE: basePath is absolute
    POST: on success requirements.yaml exists under basePath
    FAILURE_MODES: LAYOUT_INVALID
    EFFECTS: read filesystem sentinel
    TERMINATION: total
  IF exists(basePath/requirements.yaml) THEN
    RETURN
  THROW LAYOUT_INVALID

## FAIL_CLOSED_MISSING_MCP
# [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
# How: exit before MCP spawn when install-managed mcp config lacks TIED_BASE_PATH.

procedure FAIL_CLOSED_MISSING_MCP(projectRoot):
  # [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH] How: DIAGNOSTIC cites tied-install / mcp.json.
  Contract:
    INPUT: projectRoot (diagnostic context)
    OUTPUT: { error: FAIL_CLOSED_MISSING_MCP }
    PRE: READ_TIED_YAML_ENV_FROM_PROJECT_MCP returned empty TIED_BASE_PATH
    POST: stderr includes DIAGNOSTIC: TIED_CLI_MCP_BASE_PATH; process exits non-zero
    FAILURE_MODES: FAIL_CLOSED_MISSING_MCP
    EFFECTS: stderr diagnostic; terminate CLI
    TERMINATION: total
  EMIT DIAGNOSTIC: TIED_CLI_MCP_BASE_PATH with projectRoot and tied-install hint
  EXIT non-zero
