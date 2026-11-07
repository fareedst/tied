# MCP `server_info` Response Contract v1

This is an application-defined tool contract, not a core MCP-standard response type.

- Tool name: `server_info`
- Input schema: `{ "type": "object", "properties": {}, "additionalProperties": false }`
- Output schema: [`server_info.response.schema.json`](server_info.response.schema.json)
- Example: [`server_info.response.example.json`](server_info.response.example.json)
- Return the response object in MCP `CallToolResult.structuredContent`. For backward compatibility, also return serialized JSON in a text content block.
- Advertise `readOnlyHint: true` and `destructiveHint: false` in tool annotations. Treat annotations as advisory, not an access-control mechanism.

## Normative semantics

1. Core sections are always present, even if their internal optional properties are unknown.
2. Required core identity fields: `schema_version`, `generated_at`, `server.name`, `server.version`, `compatibility.mcp_protocol_version`, `compatibility.tool_contract_version`, `health.state`, and `health.checks`.
3. `schema_version` is `MAJOR.MINOR.PATCH`. Major 1 defines the fields and meanings in this schema. Different contract, API, application, database, and MCP protocol versions are independent.
4. Missing *optional* property means not advertised, not applicable, or withheld by policy; consumers must not infer a value. Explicit `null` means the property is supported but currently cannot be determined or disclosed. Use a health check's `status` to distinguish `unknown` or `not_applicable` when that distinction matters.
5. `generated_at` is the snapshot time. Check-specific `observed_at` may be older and should be interpreted accordingly.
6. `health.state`: `ready` = all core operations are currently serviceable; `degraded` = core operations can run but have a known impairment; `unavailable` = core operations cannot be completed; `unknown` = insufficient evidence to decide. The overall state is authoritative, not mechanically derived from the displayed checks.
7. Check `status`: `ok`, `degraded`, `failed`, `unknown`, or `not_applicable`; `required` indicates whether a failed dependency affects core operations. A check may represent a service, a migration, or an internal subsystem.
8. Feature `enabled` means supported and configured; `disabled` means supported but switched off; `unavailable` means configured but not currently executable; `unknown` means cannot determine. Feature status does **not** imply caller authorization. Absence means not advertised.
9. Dynamic values are point-in-time observations, not promises of future availability. `uptime_seconds` and diagnostic counters are non-negative integers.
10. Server MUST redact secrets, credentials, internal connection strings, personally identifying information, and sensitive infrastructure details. Diagnostic messages and instance IDs must be safe for the caller. Any fields the caller is not authorized to see must be omitted or null per the above rules.
11. Optional future additions go into `extensions` as namespaced object keys (for example `com.example.metrics`), or into the `features` map / `health.checks` where semantics fit. Clients MUST ignore extensions they do not understand.
12. v1 MINOR updates may add namespaced extensions, feature keys, or diagnostic check IDs without changing core field semantics. v1 PATCH updates may correct documentation or validation defects without changing meaning. Removing or renaming core fields, changing types/meaning, or changing requiredness requires a new MAJOR version.
13. Any returned `structuredContent` MUST validate against the advertised `outputSchema`. Operational unavailability is reported by `health.state`, rather than using `isError` unless the *tool call itself* fails (for example, an internal exception or authorization denial).
14. Timestamps use RFC 3339. UTC (suffix `Z`) is preferred. Server version and other application version strings may follow project conventions; `tool_contract_version` must follow SemVer.
15. `supported_operations` identifies application-defined operations implemented by this server, not all MCP tools and not the caller's permissions. The negotiated `mcp_protocol_version` is distinct from `supported_mcp_protocol_versions`.

## Conformance tests

- Valid example must pass JSON Schema 2020-12 validation with `format` checking enabled.
- Removing any required top-level section must fail.
- Unknown non-namespaced root property must fail.
- Invalid health state, negative uptime, or non-RFC3339 timestamp must fail.
- Unknown feature keys with valid IDs and future namespaced extensions must pass.
- Unexpected feature states and extension keys without a namespace must fail.
- Adding optional fields or extensions must not change existing field meanings.
- Read-only calls must not modify system state.
