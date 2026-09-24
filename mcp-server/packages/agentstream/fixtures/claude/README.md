# Claude stream oracles — [REQ-TIED_CLAUDE_LIVE_DRIVER]

**Provenance:** NDJSON captured from Claude Code CLI **2.1.273** on 2026-09-24, then sanitized (stable session placeholders, no paths/secrets/signatures). Raw captures are **local-only** (gitignored under `working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r7-raw/`).

## Pinned contract

| Field | Value |
| --- | --- |
| `cli_version` | `2.1.273` (Claude Code) |
| `capture_command` | `claude --print --verbose --output-format stream-json -- "Reply with exactly: oracle-basic"` (assistant oracle); `claude --print --verbose --output-format stream-json --resume '<invalid-uuid>' -- "hi"` (error oracle); session oracle uses `system`/`init` + assistant lines from the same capture family |
| `permissions_model` | Default permission mode for capture; operator live may use `--dangerously-skip-permissions` per README |
| `mcp_load_notes` | Repo-root `.mcp.json` + `TIED_MCP_HARNESS=claude` for bootstrap; live turn MCP load is operator-validated |
| `proof_boundary` | `no_live_claude_in_ci` |

## Oracle files

| File | Asserts |
| --- | --- |
| `stream-assistant-basic.ndjson` | Assistant text parse (`PARSE_CLAUDE_STREAM`); simple turns may omit top-level `thinking` events on 2.1.273 |
| `stream-session-id.ndjson` | `session_id` from `system`/`init` (`EXTRACT_CLAUDE_SESSION`) |
| `stream-error-exit.ndjson` | Terminal `result` with `subtype: error_during_execution` + `errors[]` |

## Schema notes (Claude Code 2.1.273 stream-json)

Each line is one JSON object. Parser-relevant `type` values:

- `system` + `subtype` `init` — optional `session_id` (live session oracle shape)
- `assistant` — `message.content[]` with `{ type: "text", text: string }` (extended thinking may appear as `{ type: "thinking", ... }` inside content; not required in frozen oracles)
- `session` — top-level `session_id` string (legacy/synthetic shape; still supported)
- `error` — `code`, `message` (when emitted as standalone events)
- `result` — terminal row; `subtype` includes `success`, `error_during_execution`, etc.; `is_error`, optional `exit_code`, optional `errors[]`

Ignored in parser: `rate_limit_event` and unknown shapes (skipped without failing parse).

Separate from Cursor `testdata/oracle/` paths; do not copy Cursor fixtures here.
