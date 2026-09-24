# R7 — Real CLI stream oracle capture receipt

**Slice:** R7 (program remainder)  
**Date:** 2026-09-24  
**CLI:** `2.1.273 (Claude Code)` at `/opt/homebrew/bin/claude`  
**Authority:** [REQ-TIED_CLAUDE_LIVE_DRIVER](../../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml)

## Capture commands (operator one-shot)

```bash
export REPO=/Users/fareed/Documents/dev/chatgpt/stdd
export EV=$REPO/working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/r7-raw
mkdir -p "$EV"

claude --print --verbose --output-format stream-json -- \
  "Reply with exactly: oracle-basic" \
  > "$EV/capture-assistant-basic.full.ndjson" 2> "$EV/capture-assistant-basic.full.stderr"

claude --print --verbose --output-format stream-json --resume \
  '00000000-0000-0000-0000-000000000000' -- "hi" \
  > "$EV/capture-error-resume.full.ndjson" 2> "$EV/capture-error-resume.stderr"
```

Session oracle lines derived from the assistant capture family (`system`/`init` + assistant + `result`), with `session_id` replaced by stable fixture placeholder `claude-fixture-session-abc123`.

## Sanitization

- Removed `rate_limit_event`, full `system`/`init` tool lists, paths, UUIDs, signatures, usage/cost fields from committed fixtures.
- Committed oracles: `mcp-server/packages/agentstream/fixtures/claude/*.ndjson`.
- Parser LEAP: `result` rows with `subtype: error_during_execution` and `errors[]` now populate exit metadata (no standalone `type: error` required).

## Verification

- `npm test` in `@tied/agentstream`: **53 pass / 0 fail** — [`agentstream-npm-test-r7-stdout.txt`](./agentstream-npm-test-r7-stdout.txt)
- Pinned `cliVersion`: **2.1.273** in `claude-driver.ts` + both README pin tables.
