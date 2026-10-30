# [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [ARCH-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]

Grammar-Version: v2

## PICK_CLIENT_PROJECT_PATH

procedure PICK_CLIENT_PROJECT_PATH(env):
  # [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [ARCH-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
  # How: canonical TIED_CLIENT_PROJECT_PATH then legacy TIED_BASE_PATH.
  Contract:
    PRE: env is a string-key map (may be empty)
    INPUT: env map
    OUTPUT: absolute path string or empty
    EFFECTS: read-only on env
    POST: canonical non-empty wins over legacy
    TERMINATION: total
  IF env.TIED_CLIENT_PROJECT_PATH is non-empty THEN RETURN trim(env.TIED_CLIENT_PROJECT_PATH)
  IF env.TIED_BASE_PATH is non-empty THEN RETURN trim(env.TIED_BASE_PATH)
  RETURN empty

## MIGRATE_MCP_PATH_ENV

procedure MIGRATE_MCP_PATH_ENV(existingEntry, pathPatch):
  # [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [ARCH-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
  # How: applyTiedMcpPathRefresh writes canonical keys then stripLegacyClientPathEnv.
  Contract:
    PRE: existingEntry is a tied-yaml mcpServers entry; pathPatch from buildTiedMcpPathPatch
    INPUT: existing tied-yaml mcpServers entry, pathPatch from buildTiedMcpPathPatch
    OUTPUT: merged entry env with canonical paths only
    EFFECTS: deletes TIED_BASE_PATH and TIED_METHODOLOGY_BUNDLE_PATH from env
    POST: returned env has canonical project/bundle paths when pathPatch supplies them
    TERMINATION: total
  merged := copy existing entry args from pathPatch
  env := merge existing.env with pathPatch.env canonical project path
  apply TIED_MCP_PATH_ENV_KEYS for bundle and store root
  env := STRIP_LEGACY_CLIENT_PATH_ENV(env)
  RETURN merged with env
