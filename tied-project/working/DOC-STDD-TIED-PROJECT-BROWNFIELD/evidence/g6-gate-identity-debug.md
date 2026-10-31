# G6 debug — `Unknown project config key: identity`

**Date:** 2026-10-31  
**Gap:** `gate:project_config_identity_key_blocks_checklist_gate_tools`

## Capture failure

| Step | Result |
| --- | --- |
| Store `tied-project/config.yaml` with `identity.routing: marker_only` | Present |
| `loadProjectConfig(stdd repo root)` on **current** `mcp-server/dist` | **OK** |
| `tied_checklist_gate_validate` via fresh Node + dist | **No identity error** (may fail on adversarial evidence fields — expected for sparse CITDP) |
| Same call via **long-lived IDE MCP** (`project-0-stdd-tied-yaml`) | **`Unknown project config key: identity`** |

## Root cause

1. **Source of truth** [`mcp-server/src/tied-project-config.ts`](../../../../mcp-server/src/tied-project-config.ts) includes `identity` in `PROJECT_CONFIG_TOP_LEVEL_KEYS` (Wave 6 intent control plane).
2. Failures in the IDE match **`CONFIG_UNKNOWN_KEY`** from an **older built MCP** that predates the allowlist entry — the stdio server process keeps the previous `dist` in memory until restart.
3. Not an alternate gate loader: gate handlers call `getBasePath()` → `loadProjectConfig()` on the project root ([`yaml-loader.ts`](../../../../mcp-server/src/yaml-loader.ts)).

## Fix / verification

1. `npm run build --prefix mcp-server`
2. **Restart** TIED YAML MCP in Cursor (Settings → MCP → tied-yaml → restart, or reload window)
3. Regression: `mcp-server/src/tied-project-config.test.ts`, `mcp-server/src/checklist-gate-project-config.test.ts`

## Done when (G6)

- Gate tools run on store repo with committed `tied-project/config.yaml` without `CONFIG_UNKNOWN_KEY` for `identity`
- Regression tests green in CI
