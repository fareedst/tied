# Three-way alignment — Phase 1 bootstrap scope (2026-09-23)

**Tokens:** [REQ-TIED_CLAUDE_HARNESS](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) · [ARCH-TIED_CLAUDE_HARNESS](../../tied/architecture-decisions/ARCH-TIED_CLAUDE_HARNESS.yaml) · [IMPL-TIED_CLAUDE_HARNESS](../../tied/implementation-decisions/IMPL-TIED_CLAUDE_HARNESS.yaml)

## Covered in this iteration (pseudo-code ↔ tests ↔ code)

| Pseudo-code block | Test locus | Production locus |
| --- | --- | --- |
| `INSTALL_CLAUDE_SKILLS` | `tools/bootstrap/lib/claude-harness.test.mjs` | `tools/bootstrap/lib/skills.mjs` |
| `INITIALIZE_CLAUDE_MCP_CONFIG` | `tools/bootstrap/lib/claude-harness.test.mjs` | `tools/bootstrap/lib/mcp-config.mjs` |
| `PRESERVE_CURSOR_MCP_INIT` | `tools/bootstrap/lib/claude-harness.test.mjs` | `initializeTiedMcpConfig` in `mcp-config.mjs` (unchanged policy) |
| Phase 1 orchestration binding (`installClaudeSkills` → `initializeClaudeMcpConfig` after Cursor init) | `claude-harness.test.mjs` `BOOTSTRAP_TIED dual harness binding` | `tools/bootstrap/lib/bootstrap.mjs` |
| `INSTALL_CLAUDE_MD_TEMPLATE` | composition / bootstrap test | `tools/bootstrap/lib/claude-md.mjs` |

## Explicitly deferred (program phase policy — not REQ gaps)

| Block | Deferral reason |
| --- | --- |
| `SELECT_AGENT_HARNESS`, `RUN_AGENTSTREAM_TURN` | Phase 2; RED at `mcp-server/packages/agentstream/src/red/harness-select-phase2.test.ts` |
| `PHASE_3` / `PUBLISH_REQ_FEAT_MATRIX` | Phase 3 client-development-index matrix |
| `RESOLVE_OPERATING_MODE`, full operating-mode automation | Documentation / gate semantics until agentstream live profile |

All named tokens exist in `tied/semantic-tokens.yaml`. Vocabulary: `tied/vocab/agentstream.md` (**harness profile**, **`--harness claude`**), `tied/vocab/tied-yaml-mcp.md` (**TIED_MCP_HARNESS**).
