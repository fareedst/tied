# Fixture contract draft — Phase 1 bootstrap RED / Phase 2 driver oracles

## Phase 1 bootstrap unit fixtures (`tools/bootstrap/lib/*.test.mjs`)

### `INITIALIZE_CLAUDE_MCP_CONFIG` / `refreshTiedMcpJson` harness env

| Fixture | PRE | Action | POST |
| --- | --- | --- | --- |
| `absent-mcp-json` | No repo-root `.mcp.json` | `initializeClaudeMcpConfig` | File created; `mcpServers.tied-yaml` stdio block; `env.TIED_BASE_PATH` absolute; `env.TIED_MCP_HARNESS=claude` |
| `foreign-server-only` | `.mcp.json` with `mcpServers.other` only | initialize | `tied-yaml` added; `other` entry deep-equal unchanged |
| `tied-yaml-present` | Existing `tied-yaml` block | initialize | `{ action: noop }`; file bytes unchanged |
| `invalid-json` | Malformed `.mcp.json` | initialize | Throws with path in message |

### `PRESERVE_CURSOR_MCP_INIT`

| Fixture | PRE | POST |
| --- | --- | --- |
| `cursor-mcp-exists` | Pre-written `.cursor/mcp.json` | `initializeTiedMcpConfig` returns `{ initialized: false }`; file unchanged |
| `cursor-mcp-absent` | No `.cursor/mcp.json` | File created (existing REQ-TIED_SETUP behavior) |

### `INSTALL_CLAUDE_SKILLS`

| Fixture | PRE | POST |
| --- | --- | --- |
| `copy-default` | Empty `.claude/skills/` | `tied-yaml/scripts/tied-cli.sh` and `build-plan/SKILL.md` + `prompt-shared/` present |
| `preserve-foreign` | Pre-existing `.claude/skills/custom/` | Custom tree retained after install |
| `symlink-without-ci` | `symlink_unix_opt_in: true`, no CI proof | Error `SYMLINK_WITHOUT_CI_WINDOWS_PROOF` |

## Phase 2 agentstream oracles (deferred — not in this pass)

- Frozen NDJSON / stream files separate from Cursor oracles under `mcp-server/packages/agentstream/fixtures/claude/` (path TBD).
- `--harness claude` selects `AgentDriver` factory; `--agent-path` does not select harness.
- Dry-run profile unchanged when harness flag absent.

## Gate receipts

- Phase 1 bootstrap: `node --test tools/bootstrap/lib/claude-harness.test.mjs` exit 0.
- Phase 2: `npm test` in `@tied/agentstream` with Claude fixture suite (future).
