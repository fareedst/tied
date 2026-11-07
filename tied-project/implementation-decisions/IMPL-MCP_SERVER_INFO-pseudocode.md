# [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO] [REQ-MCP_SERVER_INFO]
# Summary: Read-only server_info v1 snapshot for MCP preflight.

Grammar-Version: v2

## BUILD_SERVER_INFO_SNAPSHOT

- [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO] [REQ-MCP_SERVER_INFO] How: Assemble v1 sections from runtime context, health probes, and redacted config summary.
- procedure BUILD_SERVER_INFO_SNAPSHOT(options: ServerInfoBuildOptions):
  - PRE: options.implementation.name and version set.
  - DATA: checks := ASSEMBLE_HEALTH_CHECKS(projectRoot, processEnv).
  - DATA: configuration := MAP_CONFIGURATION_SUMMARY(config report or null).
  - OUTPUT: ServerInfoSnapshot with schema_version 1.0.0, structuredContent-safe fields.
  - POST: no project YAML or disk mutations.

## ASSEMBLE_HEALTH_CHECKS

- [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO] [REQ-MCP_SERVER_INFO] How: Stable check ids; derive authoritative health.state separately.
- procedure ASSEMBLE_HEALTH_CHECKS():
  - EFFECTS: read-only fs stat on requirements.yaml, validateIndex requirements, bindingStatus, runtime introspection.
  - FAILURE_MODES: corpus missing -> writable_corpus failed; unresolved base -> unknown state.

## REGISTER_SERVER_INFO_TOOL

- [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO] [REQ-MCP_SERVER_INFO] How: Core profile tool with outputSchema from contracts and readOnlyHint annotations.
- procedure REGISTER_SERVER_INFO_TOOL():
  - PRE: setServerInfoRuntimeContext from stdio entry.
  - EFFECTS: register server_info handler calling handleServerInfoTool.
  - POST: CallToolResult includes structuredContent and text JSON.
