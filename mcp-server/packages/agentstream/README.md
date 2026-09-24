# @tied/agentstream (Phase 4 — TS-only)

[IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]

## Implementation coverage

| Surface | Status |
| --- | --- |
| **Dispatcher** | Shipped via `@tied/cli` **`tied agentstream`** (TypeScript entry only after Phase **4d**) |
| **TS pipeline** | Checklist run, live executor, dry-run, reconcile, previews — default (`TIED_AGENTSTREAM_IMPL=ts` or unset) |
| **Go legacy** | **Removed** — `TIED_AGENTSTREAM_IMPL=go` exits with reinstall hint; see [phase4d-go-oracle-freeze.json](../../../working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4d-go-oracle-freeze.json) |
| **tiedpreflight** | `src/tiedpreflight.ts` |
| **Golden fixtures** | `testdata/checklist/`, `testdata/live/`, frozen oracle outputs in `testdata/oracle/` |

## Environment

- **`TIED_AGENTSTREAM_IMPL`** — `ts` (default). Value **`go`** is rejected (Phase **4d**); emergency legacy Go: checkout commit in [phase4d-go-oracle-freeze.json](../../../working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4d-go-oracle-freeze.json).
- **`AGENTSTREAM`** — optional path override for shell drivers (`scripts/run-feature-batch-agentstream.sh`, etc.).

### Qualified argv (`TIED_AGENTSTREAM_IMPL=ts`)

| Mode | Required / allowed flags |
| --- | --- |
| Tracker preview | `-c` / `--lead-checklist-yaml`, `--checklist-tracker-preview PATH` |
| Checklist render preview | `-c`, `--preview-lead-checklist`; optional bounds, `--checklist-var`, `--lead-checklist-skip-sub` |
| Feature batch preview | `--preview-feature-spec-batch-yaml PATH`, optional `-o` |
| Pipeline dry-run | `-d`, `-w`, optional `-c`, `-b`, `-p`, `-o`, checklist bounds/vars, `--skip-tied-mcp-preflight` |
| Extended dry-run | `--prompts-file`, `--tdd-yaml`, `--verify-session`, `--non-compact-html`, argv after `--` |
| Adherence reconcile | `adherence-reconcile` subcommand or standalone `--tracker` with reconcile flags |
| Live checklist + tracker | `-c`, `--checklist-tracker-yaml`, tracker vars, optional `--adherence-ledger`, `--enforce-envelope` |
| Harness profile (Phase 2) | `--harness cursor\|claude` selects **AgentDriver** profile; **`--agent-path`** remains Cursor executable override only (not a Claude adapter). Dry-run command rendering uses placeholder bin **`claude`** when `--harness claude` and `--agent-path` is unset. |
| Claude live driver ([REQ-TIED_CLAUDE_LIVE_DRIVER](../../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml)) | Live `--harness claude` routes through **SELECT_LIVE_DRIVER** → **CLAUDE_AGENT_DRIVER** with frozen oracles under `fixtures/claude/`. **CI:** fixture-only unit/composition tests (no live Claude subprocess). **Operator live:** set `AGENTSTREAM_CLAUDE_LIVE_OK=1` after local `npm test` is green; optional manual smoke only. |

### Claude CLI pin (fixture contract)

| Field | Value |
| --- | --- |
| Pinned CLI | `2.1.273` (see `fixtures/claude/README.md`; captured 2026-09-24, sanitized NDJSON) |
| Oracle root | `fixtures/claude/` (`stream-assistant-basic.ndjson`, `stream-session-id.ndjson`, `stream-error-exit.ndjson`) |
| Proof boundary | No live Claude subprocess in CI |

### Dry-run vs live (`--harness claude`)

| Mode | Behavior |
| --- | --- |
| **Dry-run** (`-d` / `--dry-run`) | Renders shell argv with placeholder bin `claude`; no subprocess. |
| **Live (CI)** | Not run — tests use mocked `launch_fn` and frozen NDJSON only. |
| **Live (operator)** | Fixture-gated: unit + composition suites green locally, then `AGENTSTREAM_CLAUDE_LIVE_OK=1` for real Claude CLI subprocess. |

### Operator live smoke (not CI)

1. **Preflight:** `npm test` in this package (must be all green).
2. **Dry-run argv** from repo root (no subprocess):

```bash
cd /path/to/your-repo
TIED_AGENTSTREAM_IMPL=ts node mcp-server/packages/agentstream/dist/index.js \
  -d -w "$(pwd)" --harness claude --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok"
```

3. **One-turn live** (human operator only; requires `claude` on PATH; Claude Code 2.x uses `--verbose` for stream-json — wired automatically when `--harness claude`):

```bash
export AGENTSTREAM_CLAUDE_LIVE_OK=1
TIED_AGENTSTREAM_IMPL=ts node mcp-server/packages/agentstream/dist/index.js \
  -w "$(pwd)" --harness claude --skip-tied-mcp-preflight \
  -- "Reply with exactly: smoke-ok"
```

Receipt example: [`working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-live-claude-smoke-r5.md`](../../../working/REQ-TIED_CLAUDE_DOC_REMAINDER/evidence/operator-live-claude-smoke-r5.md).

Unqualified argv **exit with an error** (no Go forward).

## Tests

`npm test` in this package compares TS output to **frozen oracle fixtures** under `testdata/oracle/` (RISK-UNIFIED-007). Go is not required.
