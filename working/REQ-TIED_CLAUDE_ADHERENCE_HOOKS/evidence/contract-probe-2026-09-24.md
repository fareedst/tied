# A0 — Claude hook contract probe

**REQ:** REQ-TIED_CLAUDE_ADHERENCE_HOOKS  
**Date:** 2026-09-24  
**CLI pin:** Claude Code **2.1.273** (aligned with R7 stream oracle maintenance)

## Hook location

| Surface | Path | Shareable |
| --- | --- | --- |
| Project hooks | `.claude/settings.json` → `hooks.PostToolUse` | Yes (committed) |
| Hook command script | `.claude/hooks/tied-adherence-bridge.sh` (bootstrap-written) | Yes |
| Bridge log (hook_log_ref) | `.claude/adherence-bridge.log` | Yes |

Official reference: [Claude Code hooks](https://code.claude.com/docs/en/hooks).

## Stdin fields used (PostToolUse)

| Field | Use |
| --- | --- |
| `cwd` | `workspace_roots[0]` for marker / ledger resolution |
| `hook_event_name` | Must be `PostToolUse` at source; normalized downstream |
| `tool_name` | Routes Bash / `mcp__*` / generic tool mapping |
| `tool_input.command` | Shell evidence ref digest for Bash |

## Frozen fixtures

- `mcp-server/fixtures/claude/hooks/post-tool-use-bash.json`
- `mcp-server/fixtures/claude/hooks/post-tool-use-read.json`
- `mcp-server/fixtures/claude/hooks/post-tool-use-mcp.json`

## Disposition

**bridged** — contract sufficient for append-only `action_attempted` bridge (not full transcript logging).

**Residual (accepted):** Interactive Prompt Composer without **active-turn marker** remains outside automated ledger (RISK-ADH-CL-003), not RISK-BOOT-005 once bridge ships.
