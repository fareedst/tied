# Pending handoff — full runtime config on disk (post pass 2)

**handoff_kind:** pending_queue  
**Date:** 2026-11-03  
**blocked_by:** [PLAN-rdc-env-cleanup-pass2.md](../PLAN-rdc-env-cleanup-pass2.md) (RDC pass 2 — global paths only)  
**request_token:** TBD (likely new REQ or RDC pass 3; not started)

## When to pick up

After **RDC pass 2** is implemented, verified, and closed out: operator **global paths** come from `.tied/store.yaml`, `.tied/store.local.yaml`, and client MCP JSON only. This item is the **next** wave.

## Goal

Replace **remaining** operator environment configuration with TIED **store** or **client** on-disk surfaces. **Secrets stay in env** (or secret stores), never committed yaml.

## In scope (indicative inventory)

| Class | Examples today | Target surface (TBD in refine) |
| --- | --- | --- |
| MCP / evidence toggles | `TIED_MCP_COLLECT_METRICS`, `TIED_MCP_METRICS_*`, `TIED_ENVELOPE_HOOKS` | Client `.cursor/mcp.json` env block and/or store `.tied/` operator profile |
| Agentstream session | `AGENTSTREAM_TIED_MCP_PREFLIGHT`, `AGENTSTREAM_SKIP_*`, checklist strict flags | Client or store yaml profile; spawn injection only |
| JEV non-secret | `AGENTSTREAM_JEV_HARNESS`, `TIED_JEV_DECISION_PROVIDER`, `TIED_JEV_LOCAL_BRIDGE`, `JEV_DECIDE_TRACE*` paths | Store local overlay or gitignored client profile |
| CLI session | `TIED_CLI_IMPL_ESSENCE_*` | Documented client-local or stdin-only |
| Other dev toggles | e.g. `INDESCRIPT_DOCUMENT_LOAD_PROFILING` | Product-specific disk config if first-party |

## Explicitly out of scope

| Class | Examples | Policy |
| --- | --- | --- |
| **Secrets** | `JEV_API_KEY`, API tokens, credentials | Env or secret manager only |
| **Transport** | Values MCP/Cursor inject into child process env at spawn | Not operator `export` |

## Preconditions

- Pass 2 complete: [session-handoff.md](./session-handoff.md) shows pass 2 closed; verification command_seq green.
- Sponsor refine: extend [REQ-TIED_RUNTIME_DISK_CONFIG](../) or new REQ; CITDP + `profile_depth` / gate policy chosen.
- Schema: likely extend `tied-store-config.v1` and/or client operator profile file (name TBD in refine).

## Entry commands for next session

1. Read this file + [PLAN-rdc-env-cleanup-pass2.md](../PLAN-rdc-env-cleanup-pass2.md) completion evidence.
2. Read [NON-TIED PLAN](../../NON-TIED-ON-DISK-RUNTIME-CONFIG/PLAN.md) class table (update “Feature env OK” row).
3. Run `@add-feature` or `refine-plan` on “full runtime disk except secrets”.
4. Audit: ripgrep `process.env` / shell `export TIED_` / `AGENTSTREAM_` / `JEV_` (exclude secrets) for consumer list.

## Related deferred (unchanged)

- MCP introspection (`tied_config_get_base_path` store_root / config_sources) — NON-TIED handoff item E.
- Shared JS/TS runtime fixture parity — NON-TIED handoff item 4.
