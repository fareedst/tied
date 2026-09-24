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
| Harness profile (Phase 2) | `--harness cursor\|claude` selects **AgentDriver** profile; **`--agent-path`** remains Cursor executable override only (not a Claude adapter). Dry-run command rendering uses placeholder bin **`claude`** when `--harness claude` and `--agent-path` is unset. Live Claude checklist automation stays **fixture-gated** (no CI subprocess). |

Unqualified argv **exit with an error** (no Go forward).

## Tests

`npm test` in this package compares TS output to **frozen oracle fixtures** under `testdata/oracle/` (RISK-UNIFIED-007). Go is not required.
