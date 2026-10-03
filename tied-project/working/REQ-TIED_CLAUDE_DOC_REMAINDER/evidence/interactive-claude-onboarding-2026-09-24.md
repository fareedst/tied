# Interactive Claude skill / MCP onboarding — closure receipt

**Date:** 2026-09-24  
**Claude Code CLI:** 2.1.273  
**Client fixture:** disposable bootstrap `/Users/fareed/Documents/dev/test/1790284586` (via `new-tied-client.mjs --disposable --harness claude --skip-git`)  
**Authority:** Phase 0 gap list · [operator-interactive-claude-ide-r6.md](./operator-interactive-claude-ide-r6.md) · [comparison doc § Unresolved](../../../docs/comparisons/claude-code-tied-multi-harness-plan.md)

## Summary

Closed **skill_discovery** and **mcp_stdio** gaps for repo-root `.mcp.json` stdio **`tied-yaml`** and Prompt Composer slash skills using **Claude Code CLI** on bootstrapped clients. **Operator follow-up (same day):** interactive approval completed; `claude mcp list` shows **`tied-yaml` ✔ Connected** on client `/Users/fareed/Documents/dev/test/1790278645` — log [`interactive-claude-mcp-approved-stdout.txt`](./interactive-claude-mcp-approved-stdout.txt). Default `claude -p` sessions use project MCP without `--strict-mcp-config` after approval.

## Evidence

| Check | Command / action | Result |
| --- | --- | --- |
| Bootstrap layout | `ls .claude/skills` | **15** top-level entries incl. `question`, `build-plan`, `tied-yaml`, `prompt-shared` |
| MCP config shape | `cat .mcp.json` | stdio `node` → `mcp-server/dist/index.js`; `TIED_MCP_HARNESS=claude`; absolute `TIED_BASE_PATH` |
| MCP registry (pre-approval) | `claude mcp list` on `1790284586` | **Pending approval** (expected before first interactive approve) |
| MCP registry (post-approval) | `claude mcp list` on `1790278645` | **`tied-yaml` ✔ Connected** — [`interactive-claude-mcp-approved-stdout.txt`](./interactive-claude-mcp-approved-stdout.txt) |
| MCP default session | `claude -p` without `--strict-mcp-config` after approve | **`tied_config_get_base_path`** → client `tied/` |
| MCP tool load | `claude -p --permission-mode bypassPermissions --strict-mcp-config --mcp-config ./.mcp.json -- "…tied_config_get_base_path…"` | **`{client}/tied`** |
| Leaf skill | `/question` via `claude -p …` | Answered using skill contract |
| Explicit-only skill | `/build-plan` without linked plan | Stopped per `disable-model-invocation` / missing plan rule |
| Validation hook | `node scripts/run-tied-claude-client-validation.mjs --client-root … --with-claude-code-interactive-smoke --no-agentstream-dry-run` | See [`interactive-claude-validation-stdout.txt`](./interactive-claude-validation-stdout.txt) |

## Operator notes

1. **Approve project MCP once:** In an interactive `claude` session at the client root, approve **`tied-yaml`** when prompted so tools work without `--strict-mcp-config`. **Done** on `1790278645` (2026-09-24).
2. **Scripted smoke:** `--with-claude-code-interactive-smoke` or `TIED_CLAUDE_CODE_INTERACTIVE_SMOKE=1` on validation (bootstrap README).
3. **Fallback:** `.claude/skills/tied-yaml/scripts/tied-cli.sh tied_config_get_base_path` with env from `.mcp.json`.

## Out of scope (unchanged)

- **`tied agentstream --harness claude` live** checklist (R5 / operator gate)
- Claude **adherence hooks** (R8 N/A)
- Optional Unix skill symlinks (CI-gated opt-in)
