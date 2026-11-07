# Test strategy — REQ-MCP_SERVER_INFO

**Scope:** Read-only `server_info` MCP tool and reusable `mcp-server/src/server-info/` builder.  
**Gate command:** `cd mcp-server && npm test`  
**Proof boundary:** No UI; composition limited to MCP tool registration and optional stdio call.

---

## Module validation

| Module | Boundary | Test file | Cases |
| --- | --- | --- | --- |
| `buildServerInfoSnapshot` | Pure builder; injectable `processEnv`, corpus roots via existing loader hooks | `server-info/server-info.test.ts` | Required top-level sections always present; `generated_at` RFC3339; `schema_version` `1.0.0` |
| `assembleHealthChecks` | Authoritative `health.state` vs check matrix | same | Corpus missing → `unavailable`; linked-client fixture → `ready`; introspection `unavailable` → `degraded` not `unavailable` when corpus ok |
| `mapConfigurationSummary` | Never exposes secrets | same | With linked-client fixture: no `JEV_API_KEY`, no secret catalog keys; report failure → null scalars |
| `structuredToolResult` | Dual text + structured payload | `types` unit or composition | JSON text matches `structuredContent` canonical serialization |
| MCP registration | Tool in core profile; not opt-in | `tool-profiles.test.ts` or dedicated composition | `server_info` ∈ core list; ∉ `OPTIN_TOOL_NAMES` |

---

## Schema conformance (contract § Conformance tests)

**Harness:** `ajv` draft 2020-12 + `ajv-formats` (devDependency or transitive from SDK).

| Case | Expect |
| --- | --- |
| `server_info.response.example.json` | Pass validation |
| Builder output against linked-client / store fixture | Pass validation |
| Remove required top-level section from fixture | Fail validation |
| Unknown root property | Fail validation |
| Invalid `health.state`, negative `uptime_seconds`, bad timestamp | Fail validation |
| Namespaced `extensions` key | Pass when added in test fixture |
| Non-namespaced extension key | Fail validation |

Store negative fixtures inline in test file (no committed invalid example required).

---

## Composition

| Test | Purpose |
| --- | --- |
| `server-info-mcp.composition.test.ts` (optional) | Locate `allTools` entry; invoke handler; assert `structuredContent` and text block |
| Parity with config report | Strip volatile fields; configuration subset consistent with `resolveTiedConfigReport` (pattern from `tied-config-report.test.ts`) |
| SDK output validation | If handler wired through `McpServer` in test harness, assert no `validateToolOutput` throw — else rely on Ajv parity |

**Defer:** Full e2e bootstrap stdio unless cheap extension of `bootstrap-and-load.test.ts`.

---

## Security / redaction

- Assert snapshot JSON string does not contain literal `JEV_API_KEY` value from env when set in test.
- Assert no `env_TIED_*` full paths in `configuration` section (summary only).
- `instance_id` must not equal raw `base_path`.

---

## Implementation order (TDD)

1. Contract files on disk (enables schema import).
2. RED builder tests (fixtures before handler).
3. RED schema conformance tests.
4. GREEN builder + health + configuration modules.
5. GREEN handler + tool registration.
6. Widen `index.ts` / metrics types if typecheck fails.
7. Full `npm test`.

---

## Waivers / non-goals

- No load/perf test for `server_info` latency budget (REQ 10) in v1 — manual spot-check acceptable.
- No `server_diagnostics` coverage.
