# Phase 0 gap list — Claude harness discovery

Blocks align with IMPL `PHASE_0_PILOT_ACCEPTANCE` and comparison plan **Open discovery**.

## skill_discovery

| Gap | Status | Notes |
| --- | --- | --- |
| Claude Code skill path layout (`.claude/skills/<name>/SKILL.md`) | Documented | Sponsor-locked **copy default** from bundled trees; same inventory as Cursor install |
| `prompt-shared/` relative imports from leaf skills | Assumed parity | Bundled layout mirrors Cursor; **verify** in human pilot before claiming Claude front-matter parity |
| `disable-model-invocation` / explicit-only activation on Claude | Unverified | Cursor skill contract is canonical source; Claude packaging needs pilot read-back |
| Optional Unix symlinks (`TIED_CLAUDE_SKILLS_SYMLINK`) | Deferred | Blocked on `SYMLINK_WITHOUT_CI_WINDOWS_PROOF` per IMPL |

## mcp_stdio

| Gap | Status | Notes |
| --- | --- | --- |
| Repo-root `.mcp.json` stdio shape accepted by Claude Code | Unverified | Phase 1 RED tests pin **merge/create** behavior; IDE load is separate evidence |
| MCP auth / OAuth flows on Claude | Unverified | Operator may use `tied-cli.sh` fallback ([`using-tied-without-mcp.md`](../../../tied/docs/using-tied-without-mcp.md)) |
| Safe merge must not clobber foreign `mcpServers` | Mitigated in design | Reuse `refreshTiedMcpJson` tied-yaml-only merge; hostile fixtures in unit tests |
| `TIED_MCP_HARNESS=claude` in generated env | In Phase 1 scope | Harness dimension per sponsor decision #7 |

## claude_cli_contract (Phase 2 — not Phase 1)

| Gap | Status | Notes |
| --- | --- | --- |
| Subprocess flags and permissions model | Open | Blocks Phase 2 fixtures |
| Stream schema vs Cursor `stream-json` | Open | Separate oracles required (`RISK-CLAUDE-001`) |
| Session chaining / resume | Open | AgentDriver contract in IMPL Phase 2 |
| Pinned CLI version | Open | README + fixtures in Phase 2 |
| MCP load behavior inside Claude agent turn | Open | Phase 0/1 use bootstrap MCP config only |

## agentstream_claude (explicit non-claim)

| Gap | Status | Notes |
| --- | --- | --- |
| Live checklist on Claude | **Not shipped** | No `--harness claude` in this build slice |
| `--agent-path` as Claude adapter | Rejected | Non-goal; Cursor override only |
