# Windows Claude bootstrap smoke proof (B1)

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Block:** ASSERT_WINDOWS_BOOTSTRAP_CLAUDE  
**Date:** 2026-09-23 (build-plan B1, darwin dev host); CI workflow commit 2026-09-24

## Assert list (authoritative)

From `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/phase0/windows_smoke_assert_list.md`:

| Assert | Check |
| --- | --- |
| Claude skills root | `.claude\skills` exists |
| Managed inventory | `tied-yaml` + prompt-type (`build-plan`, `prompt-shared`) under `.claude\skills` |
| Repo-root MCP | `.mcp.json` exists |
| tied-yaml server | `mcpServers.tied-yaml` present |

Implementation: `tools/bootstrap/lib/assert-windows-bootstrap-claude.mjs` (shared with `scripts/windows-bootstrap-smoke.cmd` via `tools/bootstrap/assert-windows-bootstrap-claude.mjs`).

## RED (pre-B1)

- **Observation:** `scripts/windows-bootstrap-smoke.cmd` stopped after Cursor layout + lint + Node entrypoint; no Claude asserts (Phase 0 gap doc 2026-09-23).
- **Unit RED:** `node --test tools/bootstrap/lib/claude-harness.test.mjs` — `ASSERT_WINDOWS_BOOTSTRAP_CLAUDE` fails on empty temp client (`FAIL: .claude\skills missing`).

## Local unit evidence (darwin, pre-Windows-CI)

- **Command:** `node --test tools/bootstrap/lib/claude-harness.test.mjs`
- **Result:** 11/11 pass (see `claude-harness-test-stdout.txt` in this directory)
- **Note:** Does **not** authorize `WINDOWS_COPY_PROVEN_IN_CI` flip.

## GREEN (post-B1, darwin simulation)

Commands run from repo root `/Users/fareed/Documents/dev/chatgpt/stdd`:

```bash
node --test tools/bootstrap/lib/claude-harness.test.mjs
# 10 pass (includes ASSERT_WINDOWS_BOOTSTRAP_CLAUDE RED + GREEN)

SMOKE=$(mktemp -d /tmp/tied-bootstrap-smoke-XXXX)
node tools/bootstrap/copy-files.mjs "$SMOKE"
node tools/bootstrap/assert-windows-bootstrap-claude.mjs "$SMOKE"
# exit 0 — OK: Claude Windows bootstrap asserts (claude_skills, mcp_json_tied_yaml)
```

## Windows `.cmd` smoke (target)

On a Windows host with Node 18+ and built `mcp-server/dist/index.js`:

```bat
scripts\windows-bootstrap-smoke.cmd
```

Expected after B1: steps **1b** and **3b** invoke the same Node assert CLI on `SMOKE_DIR` and Node direct-entry client.

## CI

**Workflow wired (2026-09-24):** `.github/workflows/windows-bootstrap-smoke.yml` — `windows-latest`, `npm ci` + `npm run build` in `mcp-server/`, then `scripts\windows-bootstrap-smoke.cmd`.

**First green run (pending):** After push, dispatch or wait for PR CI, then record:

| Field | Value |
| --- | --- |
| Run URL | _(fill from GitHub Actions)_ |
| Date | _(UTC)_ |
| Commit | _(SHA)_ |
| Assert path | Steps 1b + 3b → `assert-windows-bootstrap-claude.mjs` |

Trigger locally on maintainer machine:

```bash
gh workflow run "Windows bootstrap smoke"
gh run watch
```

## `windows_copy_proven_in_ci`

**Deferred — not flipped.** `WINDOWS_COPY_PROVEN_IN_CI` in `tools/bootstrap/lib/constants.mjs` remains **false** until the workflow above is **green on a Windows runner**. Darwin unit tests + simulated `copy-files.mjs` assert are supporting evidence only, not flag authorization (CITDP proof boundary, RISK-BOOT-001).
