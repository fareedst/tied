# Session handoff — on-disk TIED runtime configuration

**Date:** 2026-11-03  
**Workflow:** `non-tied-plan` (implement) after `refine-plan`  
**Plan:** [PLAN.md](PLAN.md)  
**Branch:** `main` (ahead of origin; **uncommitted** — see Git hygiene below)

## Intent (one line)

Stop using operator shell env (`TIED_MCP_BIN`, `TIED_REPO_ROOT`, `TIED_STORE_ROOT`) as global configuration; resolve store + client paths from **`.cursor/mcp.json` / `.mcp.json`** and store **`.tied/store.yaml`** (+ gitignored **`store.local.yaml`** written on install refresh).

## Delivered

| Area | What changed |
|------|----------------|
| **Resolver** | [`tools/bootstrap/lib/tied-runtime-config.mjs`](../../../tools/bootstrap/lib/tied-runtime-config.mjs) + [`tied-runtime-config.test.mjs`](../../../tools/bootstrap/lib/tied-runtime-config.test.mjs) (8 tests) |
| **Store files** | Committed [`.tied/store.yaml`](../../../.tied/store.yaml), template [`tools/bootstrap/templates/.tied/store.yaml`](../../../tools/bootstrap/templates/.tied/store.yaml), `.gitignore` → `.tied/store.local.yaml` |
| **Install** | [`installMcpLayer`](../../../tools/bootstrap/lib/layers/mcp.mjs) calls `refreshStoreRuntimeConfig` on store root |
| **CLI** | [`resolve-tied-cli-env.mjs`](../../../tools/bundled-tied-yaml-skill/scripts/resolve-tied-cli-env.mjs), [`tied-cli.sh`](../../../tools/bundled-tied-yaml-skill/scripts/tied-cli.sh) (unset global env + optional `DIAGNOSTIC: TIED_RUNTIME_IGNORED_SHELL_ENV`), [`tied.sh`](../../../tools/bundled-tied-yaml-skill/scripts/tied.sh), [`feature-orchestrator.sh`](../../../tools/bundled-tied-yaml-skill/scripts/feature-orchestrator.sh) |
| **Agentstream** | [`tied-runtime-config.ts`](../../../mcp-server/packages/agentstream/src/tied-runtime-config.ts), [`jev-harness-shared.ts`](../../../mcp-server/packages/agentstream/src/jev-harness-shared.ts) + test updates |
| **MCP / ops** | [`defaults.ts`](../../../mcp-server/src/feature-orchestration/defaults.ts) reads mcp.json; [`run-close-out-gates.mjs`](../../../tools/bootstrap/templates/run-close-out-gates.mjs); [`validate_tied`](../../../scripts/build-commands.sh) runs `tied-cli` from repo cwd only |
| **Factory** | `resolveSourceRoot` ignores shell `TIED_REPO_ROOT` |
| **E2E expectations** | [`bootstrap-and-load.test.ts`](../../../mcp-server/src/e2e/bootstrap-and-load.test.ts) — scripts must use `resolve-tied-cli-env.mjs`, not baked `TIED_REPO_ROOT` |
| **Docs** | [`SKILL.md`](../../../tools/bundled-tied-yaml-skill/SKILL.md), [`tools/bootstrap/README.md`](../../../tools/bootstrap/README.md) |

**TIED YAML:** promoted via `build-plan` → **[REQ-TIED_RUNTIME_DISK_CONFIG]** ([PLAN-refine-pass2.md](../REQ-TIED_RUNTIME_DISK_CONFIG/PLAN-refine-pass2.md), [CITDP](../../citdp/CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml)). Code unchanged in this pass; traceability + IMPL LEAP sidecars.

## Policy (operator)

- **Global paths:** disk only (mcp.json `args[0]` + `env.TIED_CLIENT_*`, optional `env.TIED_STORE_ROOT`, store yaml).
- **Still env-OK:** metrics, diagnostics, agentstream flags, `TIED_CLI_IMPL_ESSENCE_*`, etc.
- **Spawn seam:** IDE / `tied-cli` may inject resolved values into the MCP child env; that is transport, not operator configuration.

## Migration (you)

```bash
# From TIED store checkout
./tied-install.sh --refresh .

# Each linked client checkout
./tied-install.sh --refresh /path/to/client
```

This refreshes mcp path fields and creates/updates **`.tied/store.local.yaml`** on the store. Re-copy or refresh **`.cursor/skills/tied-yaml/`** so installed scripts match the bundle (no `TIED_REPO_ROOT` bake).

## Verify (ran this session)

```bash
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs
node --test tools/bootstrap/lib/mcp-base-path.test.mjs tools/bootstrap/lib/layers/mcp-layer.test.mjs tools/bootstrap/lib/new-tied-client-pipeline.test.mjs

cd mcp-server/packages/agentstream && npx tsx --test src/jev-harness-shared.test.ts

cd mcp-server && npx tsx --test src/feature-orchestration/defaults.test.ts

# Smoke (from store repo root)
node tools/bundled-tied-yaml-skill/scripts/resolve-tied-cli-env.mjs
# Expect exports for tied-project, mcp dist, TIED_STORE_ROOT under this checkout
```

**Not run (recommended before merge):**

```bash
cd mcp-server && npm test -- --test-path-pattern=bootstrap-and-load
node --test tools/bootstrap/lib/tied-cli-invoke.test.mjs
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'
```

## Remaining / optional

1. **Audit shell scripts** — [`scripts/tasd.sh`](../../../scripts/tasd.sh), [`feature-relay.sh`](../../../scripts/feature-relay.sh), [`update_client.sh`](../../../scripts/update_client.sh) for leftover `export TIED_*` patterns.
2. **MCP introspection** — extend `tied_config_get_base_path` with `store_root`, `mcp_dist`, `config_sources` (plan item E).
3. **README / mcp-server README** — trim old `TIED_BASE_PATH=.. node dist` examples (plan phase 4 partial).
4. **TS/JS parity test** — shared fixtures under `tools/bootstrap/fixtures/tied-runtime/` (plan item; logic duplicated in agentstream TS).
5. **Remove `patchTiedRepoRoot`** from skill install path or leave as no-op (scripts no longer carry placeholder).
6. **Promote to TIED** if you want REQ/ARCH/IMPL traceability.

## Git hygiene

**In scope for this handoff (runtime config):** paths listed in Delivered + new files under `tools/bootstrap/lib/tied-runtime-config*`, `.tied/`, `tools/bootstrap/templates/.tied/`, `NON-TIED-ON-DISK-RUNTIME-CONFIG/`.

**Also dirty in workspace (likely unrelated — review before commit):**

- `mcp-server/test/fixtures/**` index JSON drift  
- `tied-bundle/reports/source-graph/**`  
- `tied-project/working/evaluation/envelope-gap-report.v1.yaml`  
- Untracked `tied-project/citdp/CITDP-REQ-*.yaml` (activation/nested fixtures?)  
- `REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/close-out-handoff.md` touch  

Stage only the runtime-config slice for a focused commit, or split PRs.

## Suggested commit message (when ready)

```
Configure TIED runtime paths from mcp.json and .tied/store.yaml

Stop honoring shell TIED_MCP_BIN/TIED_REPO_ROOT/TIED_STORE_ROOT for global
paths; shared resolver for CLI, agentstream harness, close-out gates, and install refresh.
```

## Next session entry

1. Read this file + [PLAN.md](PLAN.md).  
2. Run migration refresh on store + one trial client; confirm `tied-cli.sh tied_validate_consistency '{}'`.  
3. Run bootstrap-and-load e2e; fix any linked-install skill stub expectations.  
4. Commit scoped diff or open PR.
