# Operator live Claude checklist smoke — R5 receipt

**Slice:** R5 (program remainder — not a merge gate)  
**Date:** 2026-09-24  
**Authority:** [REQ-TIED_CLAUDE_LIVE_DRIVER](../../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) · [agentstream README](../../../mcp-server/packages/agentstream/README.md)

## Preconditions checklist

| # | Precondition | This session |
| --- | --- | --- |
| 1 | `@tied/agentstream` package builds and **`npm test` green** (fixture-gated live contract) | ✅ 52/52 pass — see [`agentstream-npm-test-r5-stdout.txt`](./agentstream-npm-test-r5-stdout.txt) |
| 2 | Repo workspace is the intended TIED client (here: **stdd** methodology repo) | ✅ `/Users/fareed/Documents/dev/chatgpt/stdd` |
| 3 | **`TIED_BASE_PATH`** in `.cursor/mcp.json` (or env) points at this repo’s **`tied/`** when using TIED YAML MCP during checklist turns | Operator: verify with IDE MCP **`tied_config_get_base_path`** before YAML writes |
| 4 | Repo-root **`.mcp.json`** / **`tied-yaml`** MCP entry present if checklist turns need MCP (optional for minimal argv smoke) | stdd uses `.cursor/mcp.json`; use **`--skip-tied-mcp-preflight`** only for harness argv smoke |
| 5 | **Claude Code CLI** on `PATH` as `claude` (or set **`--agent-path`**) for live subprocess | ❌ `which claude` — not found in this environment |
| 6 | Operator sets **`AGENTSTREAM_CLAUDE_LIVE_OK=1`** only after local tests green (not CI) | Documented below; live subprocess **deferred** here |

## Copy-paste commands (minimal live smoke)

Run from repository root (`stdd`). Replace `$REPO` with your clone path.

### 1 — Fixture preflight (required before live)

```bash
cd "$REPO/mcp-server/packages/agentstream"
npm test
```

Expect: `pass 52`, `fail 0` (suite count may drift; gate is **all green**).

### 2 — Dry-run: inspect Claude argv (no subprocess)

```bash
cd "$REPO"
export TIED_AGENTSTREAM_IMPL=ts
node mcp-server/packages/agentstream/dist/index.js \
  -d -w "$REPO" \
  --harness claude \
  --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok"
```

Expect: trailing `command: "claude" "--print" "--output-format" "stream-json" ...` (placeholder bin **`claude`** when `--agent-path` unset).

Equivalent when `@tied/cli` is built and on PATH:

```bash
cd "$REPO"
TIED_AGENTSTREAM_IMPL=ts tied agentstream -d -w "$REPO" --harness claude --skip-tied-mcp-preflight -- "Reply with exactly: smoke-ok"
```

### 3 — Live one-turn (operator only; not CI)

Only after step 1 is green and **`claude`** is installed/authenticated:

```bash
cd "$REPO"
export TIED_AGENTSTREAM_IMPL=ts
export AGENTSTREAM_CLAUDE_LIVE_OK=1
node mcp-server/packages/agentstream/dist/index.js \
  -w "$REPO" \
  --harness claude \
  --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok"
```

Without **`AGENTSTREAM_CLAUDE_LIVE_OK=1`**, live harness returns **`LIVE_WITHOUT_FIXTURE_PARITY`** at the driver boundary ([`claude-driver.ts`](../../../mcp-server/packages/agentstream/src/claude-driver.ts) — operator gate).

Do **not** run a full lead checklist live unless the environment supports long-running subprocesses, MCP auth, and tracker/adherence paths; R5 scope is **preflight + argv smoke**, not R6 IDE pilot.

### Optional — full checklist dry-run (still no subprocess)

```bash
cd "$REPO"
TIED_AGENTSTREAM_IMPL=ts node mcp-server/packages/agentstream/dist/index.js \
  -d -w "$REPO" \
  --harness claude \
  --skip-tied-mcp-preflight \
  -c tied/docs/agent-req-implementation-checklist.yaml \
  --lead-checklist-from-step session-bootstrap \
  --lead-checklist-to-step session-bootstrap
```

## Outcome table

| Step | Executed this session | Result | Notes |
| --- | --- | --- | --- |
| `npm test` in `mcp-server/packages/agentstream` | Yes | **Pass** (52/52) | Log: [`agentstream-npm-test-r5-stdout.txt`](./agentstream-npm-test-r5-stdout.txt) |
| Dry-run `--harness claude -d` one-turn | Yes | **Pass** (exit 0) | Rendered `claude --print --output-format stream-json ...` |
| Live without `AGENTSTREAM_CLAUDE_LIVE_OK=1` | Yes | **Blocked** (exit 1) | Expected operator gate — no subprocess |
| Live with `AGENTSTREAM_CLAUDE_LIVE_OK=1` one-turn | Yes (2026-09-24 operator) | **Pass** (exit 0) | [`operator-live-claude-agentstream-2026-09-24.md`](./operator-live-claude-agentstream-2026-09-24.md) — direct dist + `tied agentstream` CLI |
| Full checklist live run | No | **Deferred** | Out of R5 minimal scope; one-turn live suffices to finalize LIVE_DRIVER operator gate |

## R5 completion rationale

Per remainder plan: R5 completes when **preflight tests are green**, **runbook + receipt** exist, and any live subprocess gap is **honestly blocked**. This receipt satisfies that bar; merge gates and CI do **not** require live Claude.
