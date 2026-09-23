# Planning notes — REQ-TIED_UNIFIED_TOOLCHAIN

## Refine resolutions (2026-09-22)

| Topic | Resolution | Sponsor confirmation |
| --- | --- | --- |
| Repository scope | TIED **source** repo (`stdd`) developer/operator tooling only | Confirmed |
| Client scope | Clients consume built artifacts + bootstrap; no mandate to unify client app stacks | Confirmed |
| Distribution | **Umbrella CLI** brand **`tied`** with subcommands (`mcp`, `agentstream`, `bootstrap`, `yaml`, …) | Confirmed |
| CLI brand | Operator-facing command name **`tied`** (not separate product names per tool) | Confirmed |
| Binaries vs monolith | npm/pnpm **workspace**; one `npm run build` produces MCP + CLIs | Confirmed |
| Monorepo root | **Expand `mcp-server/`** as workspace root (not `tools/tied-suite/` as primary) | Confirmed |
| Node runtime | **User-installed Node ≥18** for Phases 1–3; Phase 4 embedded runtime optional evaluation only—not committed | Confirmed |
| Bun | **Allowed only if CI proves** MCP + tests compatible; **Node canonical** for docs and release | Confirmed |
| Installers | Documented build + PATH; native `.pkg`/MSI deferred | Confirmed |
| Ruby `tools/agent-stream/` | **Deprecate** after parity checklist; remove Phase 4 | Confirmed |
| Go `tools/agentstream/` | **Strangler port** to TS; keep shipping Go until TS gate parity | Confirmed |
| Ruby adherence / hook bridges | **Port to TypeScript** with suite (e.g. `adherence_append_action_attempted`); not indefinite Ruby | Confirmed |

## profile_depth

- `depth_tier`: **minimal** (architecture/planning; no behavior change shipped)
- `gate_policy`: **advisory**
- Rationale: no runtime auth/network/persistence change in this work item; subprocess/MCP design only.

## Linked plan

Canonical plan for `/build-plan`: [PLAN.md](./PLAN.md)
