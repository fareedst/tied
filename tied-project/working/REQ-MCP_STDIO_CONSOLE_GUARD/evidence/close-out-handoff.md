# Close-out handoff — REQ-MCP_STDIO_CONSOLE_GUARD

**Date:** 2026-10-25  
**Run ID:** `close-out-req-mcp-stdio-console-guard-2026-10-25`

## Completion signals

| Signal | Result |
| --- | --- |
| **Machine close-out** | **pass** — `close_out` gate allowed; envelope blocking gaps **0** |
| **Process contract** | **pass** — `run-close-out-gates.mjs` with `--sync-dispositions --reconcile --envelope-blocking` |
| **Adherence ledger** | Reconcile read-only ok (minimal depth) |
| **Workspace (scoped REQ)** | Staging scoped to REQ-MCP_STDIO_CONSOLE_GUARD; unrelated repo drift excluded |

## Upstream feedback

**`fb-mvnztbmv-ez5nep`** — MCP DEBUG on stdout / invalid JSON; countermeasure this REQ.

## Operator note

Rebuild `mcp-server` and restart IDE **tied-yaml** MCP. Optional `TIED_MCP_DIAGNOSTICS=1` in MCP `env`.

## Commit

See [traceable-commit-evidence.md](./traceable-commit-evidence.md) for SHA after traceable commit.
