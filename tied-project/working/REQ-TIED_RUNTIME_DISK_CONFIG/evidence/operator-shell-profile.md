# Operator shell profile — paths and toggles on disk

**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG (pass 2 paths + pass 3 toggles)  
**Date:** 2026-11-03

Run `./tied-install.sh --refresh` on the store and each client. Configure **global paths** and **non-secret toggles** on disk; use env only for **secrets** and **CLI session transport** (IMPL essence stdin/file).

## Remove from shell exports

| Variable | Replace with |
| --- | --- |
| `TIED_SOURCE`, `TIED_REPO_ROOT`, `TIED_BASE_PATH`, `TIED_MCP_BIN`, `TIED_STORE_ROOT` | Store `.tied/store.yaml` + client `.cursor/mcp.json` (`tied-yaml` entry) |
| `__TIED_REPO_ROOT` (path resolution) | Same as above; JEV harness uses mcp.json + store yaml |
| `TIED_TEST_ROOT` | Optional; defaults in `build-commands.sh` to `~/Documents/dev/test`. Override with factory args, not global path env |
| `TIED_MCP_COLLECT_METRICS`, `TIED_ENVELOPE_HOOKS` | `.tied/store.yaml` or `.tied/operator.local.yaml` → `operator.mcp.*`; refresh writes mcp.json |
| `AGENTSTREAM_TIED_MCP_PREFLIGHT`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT`, `AGENTSTREAM_CHECKLIST_VAR_STRICT` | `operator.agentstream.*` on store yaml + refresh |
| `AGENTSTREAM_JEV_HARNESS`, `TIED_JEV_DECISION_PROVIDER`, `TIED_JEV_LOCAL_BRIDGE` | `operator.jev.*` (often `operator.local.yaml` gitignored) + refresh |

## Keep as env (secrets / session only)

| Variable | Purpose |
| --- | --- |
| `JEV_API_KEY` and other API tokens | Env or secret manager only — never committed yaml |
| `TIED_CLI_IMPL_ESSENCE_*` | Stdin/file session transport for tied-cli IMPL updates |
| Test-only flags (e.g. `AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR`) | Tests and CI fixtures |

## Example store operator overlay (gitignored)

`.tied/operator.local.yaml`:

```yaml
mcp:
  collect_metrics: true
  envelope_hooks: true
agentstream:
  tied_mcp_preflight: true
jev:
  harness: true
  decision_provider: local
```

Then from client checkout:

```bash
./tied-install.sh --refresh /path/to/client
```

IDE MCP spawn injects the same keys from `.cursor/mcp.json` env — no shell `export` required.

## Minimal dev shell (secrets only)

```bash
# Optional: only when using remote JEV provider
# export JEV_API_KEY=...

# No TIED_REPO_ROOT, TIED_MCP_BIN, TIED_BASE_PATH, or catalogued toggle exports.
```

## Verification

```bash
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs \
  tools/bootstrap/lib/mcp-config.test.mjs \
  tools/bootstrap/lib/layers/mcp-layer.test.mjs

.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path '{}'
```
