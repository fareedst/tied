# MCP control-via-env audit (SC-EVPOL-GAP-AUDIT)

**Date:** 2026-11-04  
**Scope:** `mcp-server/src/tools/` production handlers (exclude `*.test.ts`)  
**Source:** [TODO.md](../../../../TODO.md) item 10-07 (hybrid policy follow-on)  
**Policy:** [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../../../requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml)

## Method

1. Ripgrep `process.env` under `mcp-server/src/tools/` (non-test).
2. Classify each read as **introspection**, **spawn transport**, **harness/benchmark**, or **operational control**.
3. Record whether an explicit MCP tool argument, disk config (`.tied/store.yaml`, `tied-project/config.yaml`, `.cursor/mcp.json` refresh), or CLI flag exists.

## Findings

| Location | Env keys (literal `process.env`) | Control effect | Explicit surface | Recommendation |
| --- | --- | --- | --- | --- |
| `tied_config_report` handler in `tools/index.ts` | `TIED_CLIENT_*`, `TIED_BASE_PATH`, `TIED_STORE_ROOT` (+ full `process.env` for resolver) | Reports effective paths and binding; does not mutate behavior | **Tool:** `tied_config_report`; disk/MCP spawn per RDC | **Allowlisted** — observability (SC-EVPOL-OBSERVE); not sole control plane |
| `tools/checklist-evidence-sufficiency-mcp.ts` | Uses `input.env ?? process.env` (dynamic keys incl. `TIED_JEV_*`, `JEV_*`) | Enables JEV checklist sufficiency benchmark path | **Tool:** `tied_jev_checklist_evidence_sufficiency` (opt-in profile); manifest/yaml for steady state | Document in catalog when adding `TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY` if promoted to literal reads; v1: env-only harness toggle — **follow-on REQ** for tool-arg override |
| `tools/tool-safety-mcp.ts` | `input.env ?? process.env` (`JEV_API_KEY`, provider keys) | JEV tool-safety evaluation | **Tool:** `tied_jev_tool_safety_evaluate`; secrets via env/mcp.json per JEV REQ | **Allowlisted** secret transport; not MCP-only control |
| `tools/adherence-reconcile-runner.ts` | `ADHERENCE_RECONCILE_BIN`, `AGENTSTREAM_BIN` | Selects subprocess binaries for `tied_adherence_reconcile_run` | Partial: spawn defaults; no MCP args for bin paths | **Cataloged** (allowlist v1); **follow-on:** optional tool args for bin paths (Rule 3 gap) |

## Non-tool MCP startup controls (related)

These are not MCP tool handlers but affect which tools exist at stdio startup:

| Env key | Effect | Explicit alternative |
| --- | --- | --- |
| `TIED_MCP_TOOL_PROFILE` | Partitions registered tools (`core` / `optin` / `full`) | `.cursor/mcp.json` spawn env (install-managed); document in catalog |
| `TIED_MCP_DIAGNOSTICS` | Stdio console guard | Same — spawn env; `tied_config_report` lists value |

## Gaps deferred (v1)

- **Rule 3 (operational control):** JEV harness toggles (`TIED_JEV_*`, `AGENTSTREAM_JEV_HARNESS`) and agentstream dry-run flags remain env-first; agentstream/MCP parity is tracked under **REQ-GOAGENT-CLI-CONFIG** and JEV REQs — no code change in this build item.
- **Dynamic `env[key]` reads** (e.g. `install-options.mjs`, `plan-skills-config.ts`) are out of scope for the static inventory scanner; expand allowlist when literals are introduced.

## Evidence command

```bash
node --test tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs
```
