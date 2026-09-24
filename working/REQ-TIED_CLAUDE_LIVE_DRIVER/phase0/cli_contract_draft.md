# Phase 0 — CLI contract draft (promote to fixtures/claude/README.md at build)

**Status:** Draft for build-plan capture; pin version when oracles are frozen.

## Candidate pin fields

| Field | Value (fill at capture) | Notes |
| --- | --- | --- |
| `cli_version` | _TBD at oracle capture_ | Must match capture environment |
| `capture_command` | _TBD_ | Document exact argv that produced NDJSON |
| `permissions_model` | _TBD_ | Flags / env for permissions |
| `mcp_load_notes` | Bootstrap `.mcp.json` + `TIED_MCP_HARNESS=claude` | Live turn MCP load still Open discovery |
| `proof_boundary` | `no_live_claude_in_ci` | Hard for v1 |

## Promotion checklist

1. Create `mcp-server/packages/agentstream/fixtures/claude/` if absent
2. Capture three oracles listed in `fixture_inventory.md`
3. Write `fixtures/claude/README.md` with filled pin table
4. Mirror CLI pin + dry-vs-live table into `mcp-server/packages/agentstream/README.md`
5. Mark parent Open discovery CLI rows closed-enough for RED in Tracker evidence
