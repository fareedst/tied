# Phase 0 — Claude MCP / skill load pilot checklist

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Date:** 2026-09-23  
**Purpose:** Document operator/pilot expectations before RED on Windows smoke asserts.

## Pilot goals

1. Confirm dual-bootstrap still produces Claude skill tree and repo-root MCP on a disposable client (Unix unit already covers; Windows is the gap).
2. List what Windows smoke must assert (see `windows_smoke_assert_list.md`).
3. Confirm Cursor `.cursor/mcp.json` create-only policy is **not** in scope for mutation.

## Checklist (manual / disposable client)

| # | Check | Expected |
| --- | --- | --- |
| 1 | Run bootstrap (`copy_files` / `copy-files.mjs`) into disposable client | `tied/` present |
| 2 | `.claude/skills/` exists with managed prompt-type + `tied-yaml` skill | Inventory non-empty |
| 3 | Repo-root `.mcp.json` exists | File present |
| 4 | `.mcp.json` → `mcpServers.tied-yaml` | Server entry present |
| 5 | `.cursor/mcp.json` create-only | Unchanged policy (do not clobber foreign) |
| 6 | `TIED_MCP_HARNESS` / harness metrics dimension | Claude cohort distinct from Cursor when configured |

## Out of pilot

- Live Claude AgentDriver / stream oracles → [REQ-TIED_CLAUDE_LIVE_DRIVER]
- Symlink unlock before Windows proof
- skills/ re-root enablement

## Exit criteria for Phase 0

- Assert list locked in `windows_smoke_assert_list.md`
- No production RED yet required for Phase 0 exit
