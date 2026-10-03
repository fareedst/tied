# Phase 0 — Claude live driver discovery

**REQ:** REQ-TIED_CLAUDE_LIVE_DRIVER  
**Promoted from:** `working/REQ-TIED_CLAUDE_HARNESS/phase0/fixture_contract_draft.md` (Phase 2 rows) + `gap_list.md` (`claude_cli_contract`)  
**Locked directory:** `mcp-server/packages/agentstream/fixtures/claude/`

## Locked fixture paths

| Oracle file | Asserts |
| --- | --- |
| `mcp-server/packages/agentstream/fixtures/claude/stream-assistant-basic.ndjson` | Thinking/assistant content parse (`PARSE_CLAUDE_STREAM`) |
| `mcp-server/packages/agentstream/fixtures/claude/stream-session-id.ndjson` | Session id extraction (`EXTRACT_CLAUDE_SESSION`) |
| `mcp-server/packages/agentstream/fixtures/claude/stream-error-exit.ndjson` | Failure / exit metadata |
| `mcp-server/packages/agentstream/fixtures/claude/README.md` | Captured CLI version, capture command, schema notes (`PIN_CLAUDE_CLI_CONTRACT`) |

Exact filenames may adjust at capture time; **directory** `fixtures/claude/` is fixed and must not reuse Cursor oracle paths.

## Contract draft rows (promoted)

From parent Phase 2 agentstream oracles (deferred in parent; owned here):

- Frozen NDJSON / stream files separate from Cursor oracles under `fixtures/claude/`
- `--harness claude` selects **AgentDriver** factory for **live** path; `--agent-path` does not select harness
- Dry-run profile unchanged when harness flag absent (parent regression)

## Open discovery CLI rows (from comparison plan / parent gap_list)

| Gap | Status at plan-new-feature | Owner block |
| --- | --- | --- |
| Subprocess flags and permissions model | Open → close in PIN | `PIN_CLAUDE_CLI_CONTRACT` |
| Stream schema vs Cursor `stream-json` | Open → oracles | `PARSE_CLAUDE_STREAM` |
| Session chaining / resume | Open → session oracle | `EXTRACT_CLAUDE_SESSION` |
| Pinned CLI version | Open → README + fixtures README | `PIN_CLAUDE_CLI_CONTRACT` |
| MCP load behavior inside Claude agent turn | Open → document expectations | `PIN_CLAUDE_CLI_CONTRACT` / driver env |

## Proof boundary

- No live Claude subprocess in CI for this REQ v1
- Fixture-gated live checklist: operator may run live only after unit + composition fixtures pass
- Optional manual smoke documented in README only

## Gate receipt target

- `@tied/agentstream` `npm test` green with Claude oracle + composition suites
- Parent dry-run harness-select regression remains green
