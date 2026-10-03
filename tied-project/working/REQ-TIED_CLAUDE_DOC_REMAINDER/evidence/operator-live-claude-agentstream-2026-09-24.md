# Operator live Claude agentstream — one-turn smoke (finalize)

**Date:** 2026-09-24  
**Claude Code CLI:** 2.1.273 (on PATH)  
**Preflight:** `npm test` in `mcp-server/packages/agentstream` — **53/53 pass**  
**Workspace:** `/Users/fareed/Documents/dev/chatgpt/stdd` (methodology repo)

## Commands (copy-paste)

### Direct agentstream entry

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
export TIED_AGENTSTREAM_IMPL=ts
export AGENTSTREAM_CLAUDE_LIVE_OK=1
node mcp-server/packages/agentstream/dist/index.js \
  -w "$(pwd)" \
  --harness claude \
  --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok"
```

**Result:** exit **0** — session `3e19454f-ff73-4ccc-936d-b30118a8cee0` — log [`operator-live-claude-agentstream-2026-09-24-stdout.txt`](./operator-live-claude-agentstream-2026-09-24-stdout.txt)

### Via `@tied/cli` wrapper (`tied agentstream`)

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
export TIED_AGENTSTREAM_IMPL=ts
export AGENTSTREAM_CLAUDE_LIVE_OK=1
node mcp-server/packages/cli/dist/index.js agentstream \
  -w "$(pwd)" \
  --harness claude \
  --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok-via-tied-cli"
```

**Result:** exit **0** — session `3c37a875-ec64-438a-bac5-6fdb715e9847`

## Scope

One-turn live subprocess through **`--harness claude`** / **AgentDriver** with operator gate **`AGENTSTREAM_CLAUDE_LIVE_OK=1`**. Not a full lead checklist live run (Tracker receipts, multi-turn, MCP preflight on client `.mcp.json`).

## Authority

[R5 runbook](./operator-live-claude-smoke-r5.md) step 3 · [agentstream README](../../../mcp-server/packages/agentstream/README.md) · [REQ-TIED_CLAUDE_LIVE_DRIVER](../../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml)
