# Phase 0 pilot notes — REQ-TIED_CLAUDE_HARNESS

**Recorded:** 2026-09-23 (build-plan slice)  
**Scope:** Repo research + sponsor comparison doc; **no** live Claude Code IDE session in this slice.

## Operating modes (explicit)

| Mode | Evidence accepted this program |
| --- | --- |
| Interactive Prompt Composer (`build-plan`, …) | MCP / `tied-cli` writes; manual Tracker updates |
| Semi-automated | Same skills + Authoritative Tracker discipline |
| `tied agentstream` | Tracker receipts + driver contracts only |

**Forbidden claim:** Successful interactive `/build-plan` does **not** prove `tied agentstream --harness claude` works. Phase 2 remains fixture-gated.

## Current repo evidence (Cursor reference path)

- Bootstrap: [`tools/bootstrap/lib/mcp-config.mjs`](../../../tools/bootstrap/lib/mcp-config.mjs) — `initializeTiedMcpConfig` creates `.cursor/mcp.json` **only when absent**; `refreshTiedMcpJson` merges `mcpServers.tied-yaml` into an existing JSON file.
- Skills: [`tools/bootstrap/lib/skills.mjs`](../../../tools/bootstrap/lib/skills.mjs) installs bundled Prompt Composer + `tied-yaml` under `.cursor/skills/` only.
- Agentstream: Cursor `agent` + `stream-json`; `--agent-path` overrides executable only ([`mcp-server/packages/agentstream/README.md`](../../../mcp-server/packages/agentstream/README.md)).

## Phase 0 acceptance for this slice

- Gap list and fixture contract draft populated under `phase0/`.
- Go/no-go for Phase 1 bootstrap code: **go** — remaining unknowns are fixture/schema verification, not program scope disputes.
- Phase 0 does **not** require canonical bootstrap or agentstream production edits (Phase 1+ owns bootstrap).

## TIED MCP base path ritual

Before any project YAML write: `tied_config_get_base_path` must resolve to the active repo’s `tied/` (see [`tied/vocab/tied-yaml-mcp.md`](../../../tied/vocab/tied-yaml-mcp.md)).

## Temporary skill copy (operator pilot)

For a human Claude pilot (outside this build slice): copy `tools/bundled-prompt-type-skills/` and `tools/bundled-tied-yaml-skill/` into `.claude/skills/` manually; configure repo-root `.mcp.json` or use `tied-cli.sh` per [`tied/docs/using-tied-without-mcp.md`](../../../tied/docs/using-tied-without-mcp.md). Do not treat that as agentstream automation evidence.
