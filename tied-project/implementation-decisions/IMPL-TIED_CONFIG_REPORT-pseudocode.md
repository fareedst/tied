# IMPL-TIED_CONFIG_REPORT essence pseudocode

<!-- [IMPL-TIED_CONFIG_REPORT] [ARCH-TIED_CONFIG_REPORT] [REQ-TIED_CONFIG_REPORT] -->

## BUILD_TIED_CONFIG_REPORT

```
// [IMPL-TIED_CONFIG_REPORT] [ARCH-TIED_CONFIG_REPORT] [REQ-TIED_CONFIG_REPORT]
// How: Read-only aggregate of resolveTiedRuntimeConfig, operator yaml, mcp.json env, and catalogued env keys with provenance.
procedure BUILD_TIED_CONFIG_REPORT(cwd, processEnv, includeSecrets):
  PRE: cwd is absolute or resolvable; processEnv is a map
  POST: returns schema tied-config-report.v1
  EFFECTS: none (read-only)
  FAILURE_MODES: propagates TIED_RUNTIME_CONFIG_* from resolveTiedRuntimeConfig

  runtime := RESOLVE_TIED_RUNTIME_CONFIG(cwd, processEnv, requireDistExists=false)
  operator := LOAD_MERGED_OPERATOR_CONFIG(runtime.storeRoot)
  mcpEnv := READ_TIED_YAML_SERVER_ENTRY(runtime.projectRoot).env
  mapped := MAP_OPERATOR_CONFIG_TO_MCP_ENV(operator, mcpEnv)

  sections := []
  APPEND paths section from runtime paths + config_sources
  APPEND operator_toggles from OPERATOR_*_MCP_FIELDS with disk-vs-mcp provenance
  APPEND mcp_spawn_env for TIED_CLIENT_* and related keys present in mcpEnv
  APPEND cli_session for CLI_SESSION_ENV_KEYS present in processEnv
  APPEND secrets for SECRET_ENV_KEYS with redaction unless includeSecrets

  shell_ignored := keys in IGNORED_GLOBAL_SHELL_KEYS and OPERATOR_TOGGLE_ENV_KEYS when shell value differs from effective
  RETURN report object with notes linking tied_config_get_base_path for live routing
```

## CLI_MAIN

```
// [IMPL-TIED_CONFIG_REPORT] — How: No MCP spawn; stdout JSON or text; stderr warning for includeSecrets.
procedure CLI_MAIN(argv):
  PRE: invoked from store or client cwd with install mcp.json or store yaml
  POST: exit 0 with report on stdout when surfaces resolvable
  parse --include-secrets and --format
  WHEN includeSecrets THEN WARN stderr
  report := BUILD_TIED_CONFIG_REPORT(process.cwd(), process.env, includeSecrets)
  EMIT json OR formatTiedConfigReportText(report)
```

## MCP_TIED_CONFIG_REPORT

```
// [IMPL-TIED_CONFIG_REPORT] [REQ-TIED_CONFIG_REPORT] SC-CR-MCP-PARITY
// How: Dynamic import bootstrap module; core tool profile; same JSON as CLI.
procedure MCP_TIED_CONFIG_REPORT(includeSecrets, format):
  project_root := GET_CLIENT_PROJECT_ROOT()
  result := RESOLVE_TIED_CONFIG_REPORT(project_root, process.env, includeSecrets)
  WHEN result.status != ok THEN RETURN error json
  WHEN format == text THEN RETURN formatTiedConfigReportText(result.report)
  RETURN prettyCanonicalJson(result.report)
```
