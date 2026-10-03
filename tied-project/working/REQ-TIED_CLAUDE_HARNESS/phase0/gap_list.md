# Phase 0 gap list — Claude harness discovery

Blocks align with IMPL `PHASE_0_PILOT_ACCEPTANCE` and comparison plan **Open discovery**.

## skill_discovery

| Gap | Status | Notes |
| --- | --- | --- |
| Claude Code skill path layout (`.claude/skills/<name>/SKILL.md`) | Documented | Sponsor-locked **copy default** from bundled trees; same inventory as Cursor install |
| `prompt-shared/` relative imports from leaf skills | **Verified (2026-09-24)** | Copy-default install includes full `prompt-shared/` tree; leaf `SKILL.md` links match Cursor bundle — evidence [`interactive-claude-onboarding-2026-09-24.md`](../../REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-onboarding-2026-09-24.md) |
| `disable-model-invocation` / explicit-only activation on Claude | **Verified (2026-09-24)** | Claude Code **2.1.273**: `/question` resolves leaf skill; `/build-plan` without linked plan stops per skill contract — same receipt |
| Optional Unix symlinks (`TIED_CLAUDE_SKILLS_SYMLINK`) | Deferred | Blocked on `SYMLINK_WITHOUT_CI_WINDOWS_PROOF` per IMPL |

## mcp_stdio

| Gap | Status | Notes |
| --- | --- | --- |
| Repo-root `.mcp.json` stdio shape accepted by Claude Code | **Verified (2026-09-24)** | `claude mcp get tied-yaml` reads project config; `claude -p --strict-mcp-config --mcp-config .mcp.json` loads stdio and `tied_config_get_base_path` matches client `tied/` — receipt above |
| MCP auth / OAuth flows on Claude | **N/A for tied-yaml stdio** | No OAuth for local stdio server; project-scoped **Pending approval** until operator approves in interactive `claude` (documented in bootstrap README). Fallback: `tied-cli.sh` ([`using-tied-without-mcp.md`](../../../tied/docs/using-tied-without-mcp.md)) |
| Safe merge must not clobber foreign `mcpServers` | Mitigated in design | Reuse `refreshTiedMcpJson` tied-yaml-only merge; hostile fixtures in unit tests |
| `TIED_MCP_HARNESS=claude` in generated env | In Phase 1 scope | Harness dimension per sponsor decision #7 |

## claude_cli_contract (LIVE_DRIVER — historical Phase 2)

| Gap | Status | Notes |
| --- | --- | --- |
| Subprocess flags and permissions model | **Current** | **`REQ-TIED_CLAUDE_LIVE_DRIVER`** / `AgentDriver`; operator gate **`AGENTSTREAM_CLAUDE_LIVE_OK=1`** |
| Stream schema vs Cursor `stream-json` | **Current** | Separate NDJSON oracles under **`fixtures/claude/`** (`RISK-CLAUDE-001` mitigated in fixtures) |
| Session chaining / resume | **Current (fixture scope)** | Covered by driver composition tests; live operator smoke optional (R5) |
| Pinned CLI version | **Current** | **2.1.273** in fixtures README + R7 receipt |
| MCP load behavior inside Claude agent turn | **Partial** | Bootstrap **`.mcp.json`** + interactive MCP verified (R6); agent-turn MCP not separately oracled |

## agentstream_claude

| Gap | Status | Notes |
| --- | --- | --- |
| Live checklist on Claude | **Current (fixture-gated + operator)** | **`--harness claude`** shipped; CI uses fixtures; live requires operator env gate |
| `--agent-path` as Claude adapter | Rejected | Non-goal; Cursor override only |

## R6 cross-reference (2026-09-24)

Automatable evidence: bootstrap **17/17** (`working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/claude-harness-test-r6-stdout.txt`), agentstream **53/53**, static **`prompt-shared/`** layout in bundled skills. Operator runbook: [`operator-interactive-claude-ide-r6.md`](../../REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-interactive-claude-ide-r6.md).

**2026-09-24 closure:** Claude Code CLI **2.1.273** on a bootstrapped disposable client verified skill discovery + stdio MCP load — [`interactive-claude-onboarding-2026-09-24.md`](../../REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-onboarding-2026-09-24.md). Optional **`--with-claude-code-interactive-smoke`** on [`run-tied-claude-client-validation.mjs`](../../../scripts/run-tied-claude-client-validation.mjs) reproduces MCP base-path check.

**Operator approval (2026-09-24):** `claude mcp list` → **`tied-yaml` ✔ Connected** on bootstrapped client `1790278645`; default `claude -p` MCP tool use without `--strict-mcp-config` — [`interactive-claude-mcp-approved-stdout.txt`](../../REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/interactive-claude-mcp-approved-stdout.txt). Automation vs **`tied agentstream`** boundary unchanged (§ E in R6 receipt; R5).

**Note (repo drift):** `agentstream_claude` table above predates **`REQ-TIED_CLAUDE_LIVE_DRIVER`**; fixture-gated **`--harness claude`** is shipped — see R5 receipt and agentstream README. IDE onboarding gaps remain distinct from driver automation.
