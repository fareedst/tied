# Phase 0 — Windows smoke assert expectations (B1)

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Target script:** `scripts/windows-bootstrap-smoke.cmd`  
**Hard gate:** These asserts (green in CI/smoke) are the only evidence allowed to flip `windows_copy_proven_in_ci`.

## Current gap (2026-09-23)

Smoke today asserts:

- Node on PATH
- `copy_files.cmd` / `copy-files.mjs` create `tied/requirements.yaml`
- `.cursor/mcp.json` present
- `lint_yaml.cmd -F tied`

Smoke does **not** yet assert:

- `.claude/skills/` managed inventory
- Repo-root `.mcp.json` with `tied-yaml`

## Required asserts (B1 RED → GREEN)

After bootstrap into `SMOKE_DIR` (and Node direct entrypoint client if retained):

| Assert | Path / check | Fail code / message (proposed) |
| --- | --- | --- |
| Claude skills root | `%SMOKE_DIR%\.claude\skills` exists | `FAIL: .claude\skills missing` |
| Managed inventory | At least prompt-type skills and/or `tied-yaml` under `.claude\skills` (match Unix harness inventory policy) | `FAIL: Claude skills inventory incomplete` |
| Repo-root MCP | `%SMOKE_DIR%\.mcp.json` exists | `FAIL: repo-root .mcp.json missing` |
| tied-yaml server | `.mcp.json` contains `tied-yaml` under `mcpServers` (string search or Node one-liner OK) | `FAIL: mcpServers.tied-yaml missing` |

## Proof artifact

On green: write `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/windows-claude-smoke-proof.md` (or CI log capture) citing command, date, and assert list. **Only then** may B2 flip `windows_copy_proven_in_ci`.

## CI wiring

If a Windows bootstrap CI job exists, add the same asserts there; if not, smoke script proof + documented job gap is residual until CI lands — still do not flip the flag from Unix unit tests alone.

## Non-asserts (out of B1)

- Symlink behavior on Windows
- skills/ re-root destinations
- Live Claude CLI
