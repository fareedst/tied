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

- `depth_tier`: **`integrated`** (sponsor confirmed 2026-09-22; effective Phase 3b **slice 2+**)
- `prior_depth_tier`: **`minimal`** (slice 1 planning + close-out arc)
- `gate_policy`: **advisory**
- Rationale: Remaining strangler work (executor, pipeline, checklist render, adherence) targets checklist/adherence parity and subprocess orchestration—integrated adversarial inquiry per AGENTS §3.3.1 for slice 2+.

## Git / release policy (2026-09-22 → 2026-09-23)

- **Push deferred** until **Phase 3b complete** (slices **2a–2d**) — **satisfied** 2026-09-23.
- **origin/main:** `a23d939` (slice 1) + **`fbe65e197d456b4dce8a9d062b112f4155d9ce36`** (2a–2d + close_out evidence).

## Unified Phase 3b close_out (2026-09-23)

- **Milestone:** slices **2a–2d** qualified TS surface; unified `close_out` with inquiry `slice3b-close-out-2026-09-23`.
- **Committable gate receipt:** [phase3b-full-close-out-gate.json](./phase3b-full-close-out-gate.json).
- **Post-push:** Re-ran close-out runner with `--run-id slice3b-close-out-2026-09-23`; `allowed: true`, envelope blocking gaps **0** (advisory diagnostics remain).
- **REQ status:** remains **In Progress** — Phase 4 (Go/Ruby removal, live executor TS-default) not in scope.
- **Vocabulary Touchpoint 3:** `strangler slice`, `TS-native argv surface`, `adherence-reconcile` — validated against [tied/vocab/tied-methodology.md](../../tied/vocab/tied-methodology.md) and [tied/vocab/agentstream.md](../../tied/vocab/agentstream.md).

## Slice order (2026-09-22)

- **Confirmed:** **2a** executor dry-run → **2b** pipeline/batch → **2c** checklist render → **2d** adherence strangler.

## Linked plan

Canonical plan for `/build-plan`: [PLAN.md](./PLAN.md)
