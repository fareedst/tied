# TIED first-party environment catalog

**Normative allowlist:** [tools/bootstrap/fixtures/tied-env-allowlist/env-allowlist.v1.yaml](../tools/bootstrap/fixtures/tied-env-allowlist/env-allowlist.v1.yaml)  
**Policy:** [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../tied-project/requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml)  
**Inventory test (SC-EVPOL-INVENTORY):** `node --test tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs`  
**Effective settings (SC-EVPOL-OBSERVE):** MCP tool `tied_config_report` / bootstrap `tied-config-report` — see [REQ-TIED_CONFIG_REPORT](../tied-project/requirements/REQ-TIED_CONFIG_REPORT.yaml).

Each `process.env` read under the allowlist `scan_roots` must appear in this catalog and in the committed allowlist before merge.

| env_key | class | owner_req | notes |
| --- | --- | --- | --- |
| `TIED_CLIENT_PROJECT_PATH` | spawn_transport | REQ-TIED_CLI_MCP_JSON_BASE_PATH | MCP child corpus path; install writes mcp.json |
| `TIED_CLIENT_BUNDLE_PATH` | spawn_transport | REQ-TIED_CLI_MCP_JSON_BASE_PATH | Linked bundle path |
| `TIED_BASE_PATH` | deprecated_legacy | REQ-TIED_CLI_MCP_JSON_BASE_PATH | Legacy alias; dual-read with TIED_CLIENT_PROJECT_PATH |
| `TIED_METHODOLOGY_BUNDLE_PATH` | spawn_transport | REQ-TIED_TWO_FOLDER_LAYOUT | Bundled methodology read path when set |
| `TIED_STORE_ROOT` | spawn_transport | REQ-TIED_RUNTIME_DISK_CONFIG | Spawn-only; shell override ignored for resolution |
| `TIED_MCP_BIN` | spawn_transport | REQ-TIED_RUNTIME_DISK_CONFIG | Dist path; prefer args[0] + disk resolver |
| `TIED_PATH_AUTHORITY` | diagnostic | REQ-TIED_CLI_MCP_JSON_BASE_PATH | Test-only authority mode in yaml-loader tests |
| `TIED_ENVELOPE_HOOKS` | operator_toggle | REQ-REQUEST_EVIDENCE_ENVELOPE | Prefer operator yaml + mcp refresh |
| `TIED_MCP_COLLECT_METRICS` | operator_toggle | REQ-MCP_USAGE_METRICS | Prefer operator yaml |
| `TIED_MCP_METRICS_PATH` | cli_session | REQ-MCP_USAGE_METRICS | Override metrics JSONL path |
| `TIED_MCP_METRICS_CLIENT` | cli_session | REQ-MCP_USAGE_METRICS | Client label in metrics rows |
| `TIED_MCP_PROJECT_ID` | operator_toggle | REQ-MCP_USAGE_METRICS | Configured project identity |
| `TIED_MCP_DIAGNOSTICS` | diagnostic | REQ-MCP_STDIO_CONSOLE_GUARD | Stderr diagnostics guard |
| `TIED_YAML_STYLE` | operator_toggle | REQ-TIED_YAML_STYLE_CONFIGURATION | Fallback below tied-project/config.yaml |
| `TIED_CLI_IMPL_ESSENCE_FILE` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Large IMPL body transport |
| `TIED_CLI_IMPL_ESSENCE_STDIN` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | IMPL body from stdin |
| `TIED_CLI_ARGS_FILE` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Large MCP args payload |
| `TIED_CLI_QUIET_MCP_STDERR` | cli_session | REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE | Operator output texture |
| `TIED_BOOTSTRAP_OUT_PATH` | diagnostic | REQ-TIED_SETUP | Bootstrap logging stream selector |
| `TIED_MCP_TOOL_PROFILE` | spawn_transport | REQ-TIED_UNIFIED_TOOLCHAIN | Opt-in MCP tool surface |
| `TIED_JEV_DECISION_PROVIDER` | operator_toggle | REQ-TIED_JEV_DECISION_COPROCESSOR | JEV harness routing |
| `TIED_JEV_LOCAL_BRIDGE` | operator_toggle | REQ-TIED_JEV_DECISION_COPROCESSOR | Local bridge toggle |
| `JEV_API_KEY` | secret | REQ-TIED_JEV_DECISION_COPROCESSOR | Never commit; not in mcp.json |
| `AGENTSTREAM_TIED_MCP_PREFLIGHT` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Agentstream preflight |
| `AGENTSTREAM_CLAUDE_LIVE_OK` | diagnostic | REQ-GOAGENT-CLI-CONFIG | Live Claude driver opt-in; harness only |
| `AGENTSTREAM_CLAUDE_STRICT_MCP` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Claude argv MCP strictness |
| `AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Claude permissions harness |
| `AGENTSTREAM_HARNESS_TRACE` | diagnostic | REQ-GOAGENT-CLI-CONFIG | Harness turn trace enable |
| `AGENTSTREAM_HARNESS_TRACE_PATH` | cli_session | REQ-GOAGENT-CLI-CONFIG | Override harness trace path |
| `TIED_MCP_TEST_REPO_ROOT` | test_only | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Allowed only under excluded test paths |
| `TIED_CLI_MCP_BIN` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | tied-cli MCP dist override for stdio client |
| `TIED_CLI_UMBRELLA_ENTRY` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Umbrella MCP entry path for tied-cli spawn |
| `TIED_CLI_UMBRELLA_MCP` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Use umbrella MCP subcommand instead of dist bin |
| `TIED_CLI_REQUEST_ID` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | JSON-RPC request id for one-shot CLI MCP calls |
| `TIED_CLI_TOOL_NAME` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Target MCP tool name for one-shot CLI calls |
| `TIED_CLI_ARGS_JSON` | cli_session | REQ-TIED_TOOL_INPUT_COMPATIBILITY | Inline JSON args when TIED_CLI_ARGS_FILE unset |
| `TIED_AGENTSTREAM_IMPL` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Agentstream executor backend ts\|go |
| `AGENTSTREAM_JEV_HARNESS` | diagnostic | REQ-TIED_JEV_DECISION_COPROCESSOR | Enable JEV harness dist preflight in agentstream |
| `AGENTSTREAM_DAE_GATE_CHECK` | diagnostic | REQ-GOAGENT-CLI-CONFIG | DAE gate preflight in agentstream dry-run |
| `AGENTSTREAM_CHECKLIST_VAR_STRICT` | diagnostic | REQ-GOAGENT-CLI-CONFIG | Strict checklist variable validation in dry-run |
| `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Skip agentstream tied MCP preflight |
| `AGENTSTREAM_SKIP_WORKSPACE_PRELOAD` | operator_toggle | REQ-GOAGENT-CLI-CONFIG | Skip workspace preload in dry-run |
| `AGENTSTREAM_RUN_ID` | cli_session | REQ-GOAGENT-CLI-CONFIG | Override run id in dry-run config |
| `ADHERENCE_RECONCILE_BIN` | cli_session | REQ-GOAGENT-CLI-CONFIG | Override adherence reconcile binary path |
| `AGENTSTREAM_BIN` | cli_session | REQ-GOAGENT-CLI-CONFIG | Override agentstream binary for adherence runner |
| `JEV_MODEL` | cli_session | REQ-TIED_JEV_DECISION_COPROCESSOR | JEV model id for benchmarks and harness |
| `PLUMB_AUDIT_LOCALITY` | diagnostic | REQ-TIED_SETUP | Plumb audit locality report mode |
| `PLUMB_AUDIT_GATE_OVERRIDE` | diagnostic | REQ-TIED_SETUP | Override plumb audit gate (dangerous; audit only) |
| `GIT_INDEX_FILE` | cli_session | REQ-TIED_SETUP | Temporary git index for plumb audit CLI |
| `GIT_SHA` | runtime_passthrough | REQ-TIED_EASAR_RECOVERY | CI/provenance SHA for inventory receipts |
| `CLAUDE_PROJECT_DIR` | runtime_passthrough | REQ-TIED_CLAUDE_ADHERENCE_HOOKS | Claude Code project dir for adherence bridge hook |
| `PATH` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Node spawn PATH passthrough (isolated verify, tied-cli) |
| `HOME` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Node spawn HOME passthrough for tied-cli MCP child |
| `NODE_ENV` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Node spawn NODE_ENV passthrough for tied-cli MCP child |
| `NODE_OPTIONS` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Forwarded for isolated verification subprocess |
| `TZ` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Forwarded for isolated verification subprocess |
| `LANG` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Forwarded for isolated verification subprocess |
| `SystemRoot` | runtime_passthrough | REQ-TIED_ENVIRONMENT_VARIABLE_POLICY | Windows spawn passthrough for tied-cli MCP child |
| `NO_COLOR` | runtime_passthrough | REQ-TIED_SETUP | Bootstrap console color disable |
