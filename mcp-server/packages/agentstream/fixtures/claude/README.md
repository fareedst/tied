# Claude stream oracles — [REQ-TIED_CLAUDE_LIVE_DRIVER]

**Provenance:** Synthetic NDJSON authored for fixture-gated unit tests (not captured from a live Claude CLI run). Replace with captured oracles when a pinned CLI capture is available; keep filenames stable.

## Pinned contract

| Field | Value |
| --- | --- |
| `cli_version` | `synthetic-v1` (document-only until live capture) |
| `capture_command` | _N/A — synthetic fixtures; future: `claude --print --output-format stream-json …` per operator pin_ |
| `permissions_model` | `--dangerously-skip-permissions` or interactive allow-list (operator manual live only) |
| `mcp_load_notes` | Repo-root `.mcp.json` + `TIED_MCP_HARNESS=claude` for bootstrap; live turn MCP load is operator-validated |
| `proof_boundary` | `no_live_claude_in_ci` |

## Oracle files

| File | Asserts |
| --- | --- |
| `stream-assistant-basic.ndjson` | Thinking + assistant text (`PARSE_CLAUDE_STREAM`) |
| `stream-session-id.ndjson` | `session_id` extraction (`EXTRACT_CLAUDE_SESSION`) |
| `stream-error-exit.ndjson` | Error + non-zero exit metadata |

## Schema notes (synthetic v1)

Each line is one JSON object. Known `type` values:

- `thinking` — `subtype` `delta` (optional `text`) or `completed`
- `assistant` — `message.content[]` with `{ type: "text", text: string }`
- `session` — top-level `session_id` string
- `error` — `code`, `message`
- `result` — terminal row; `subtype` `success` \| `error`, optional `exit_code`, `is_error`

Separate from Cursor `testdata/oracle/` paths; do not copy Cursor fixtures here.
