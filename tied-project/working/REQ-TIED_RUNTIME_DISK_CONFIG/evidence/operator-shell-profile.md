# Operator shell profile — global paths vs session toggles

**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG (pass 2)  
**Date:** 2026-11-03

After pass 2, **do not export** global path variables. Run `./tied-install.sh --refresh` on the store and each client; configure Cursor `.cursor/mcp.json` for IDE MCP.

## Remove from shell exports

| Variable | Replace with |
| --- | --- |
| `TIED_SOURCE`, `TIED_REPO_ROOT`, `TIED_BASE_PATH`, `TIED_MCP_BIN`, `TIED_STORE_ROOT` | Store `.tied/store.yaml` + client `.cursor/mcp.json` (`tied-yaml` entry) |
| `__TIED_REPO_ROOT` (path resolution) | Same as above; JEV harness uses mcp.json + store yaml |
| `TIED_TEST_ROOT` | Optional; defaults in `build-commands.sh` to `~/Documents/dev/test`. Override with `test-new-tied-client` / factory args, not global path env |

## Keep as env (session / secrets)

| Variable | Purpose |
| --- | --- |
| `TIED_MCP_COLLECT_METRICS`, `TIED_MCP_METRICS_*` | Opt-in MCP metrics JSONL |
| `TIED_ENVELOPE_HOOKS` | Request evidence envelope dual-write |
| `AGENTSTREAM_*` | Agentstream preflight and session flags |
| `JEV_*`, `TIED_JEV_*` (non-secret) | JEV harness, trace, local provider — **full on-disk migration queued** in [pending-full-runtime-disk-handoff.md](./pending-full-runtime-disk-handoff.md) |
| `JEV_API_KEY` and other secrets | Env or secret manager only |

## Minimal example (store dev shell)

```bash
# Metrics / envelope / agentstream (session toggles — env OK)
export TIED_MCP_COLLECT_METRICS=1
export TIED_ENVELOPE_HOOKS=1
export AGENTSTREAM_TIED_MCP_PREFLIGHT=1

# No TIED_REPO_ROOT, TIED_MCP_BIN, or TIED_BASE_PATH exports.
# IDE: set matching keys in .cursor/mcp.json env when needed for in-editor MCP.
```

## Verification

From store or client checkout (with valid mcp.json):

```bash
node tools/bundled-tied-yaml-skill/scripts/resolve-tied-cli-env.mjs
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'
```
