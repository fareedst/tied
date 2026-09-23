# @tied/agentstream (Phase 3 strangler)

[IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]

## Implementation coverage

| Surface | Status |
| --- | --- |
| **Dispatcher** (`TIED_AGENTSTREAM_IMPL=go\|ts`) | Shipped via `@tied/cli` `tied agentstream` |
| **Go pipeline** (checklist run, live executor) | **Default** — exec `AGENTSTREAM` or `go run -C tools/agentstream ./cmd/agentstream` |
| **TS dry-run** (pipeline subset, qualified argv) | **`TIED_AGENTSTREAM_IMPL=ts`** — no Go forward for qualified `-d` (slices 2a–2b) |
| **TS `--preview-feature-spec-batch-yaml`** | **TypeScript** — `src/featurespec-preview.ts` (slice 2b); parity vs Go |
| **TS `--preview-lead-checklist`** | **TypeScript** — `src/checklist-preview.ts` (slice 2c); parity vs Go on checklist testdata |
| **tiedpreflight** (static `.cursor/mcp.json` / `TIED_BASE_PATH`) | **TypeScript** — `src/tiedpreflight.ts` |
| **`--checklist-tracker-preview`** | **TypeScript** — `src/tracker-migration-preview.ts` (Phase 3b slice 1); parity vs Go on golden testdata |
| **adherence-reconcile** (read-only operator surface) | **TypeScript** — `adherence-reconcile-cli.ts` + `adherence-reconcile.ts` (slice 2d); parity vs Go CLI |
| **Live executor** | **Go only** (Phase 4 scope, RISK-UNIFIED-001) |

## Environment

- **`TIED_AGENTSTREAM_IMPL`** — `go` (default) or `ts`. `go` spawns the Go binary directly. `ts` runs this package entry with **TS-native** paths below; unqualified argv **forwards to Go** with stderr `DIAGNOSTIC`.

### Qualified argv (`TIED_AGENTSTREAM_IMPL=ts`, no Go forward)

| Mode | Required / allowed flags |
| --- | --- |
| Tracker preview | `-c` / `--lead-checklist-yaml`, `--checklist-tracker-preview PATH` |
| Checklist render preview | `-c` / `--lead-checklist-yaml`, `--preview-lead-checklist`; optional `--lead-checklist-from-step`, `--lead-checklist-to-step`, `--lead-checklist-skip-sub`, repeatable `--checklist-var KEY=VALUE`, `--checklist-var-strict` |
| Feature batch preview | `--preview-feature-spec-batch-yaml PATH`, optional `-o` / `--select-order` |
| Pipeline dry-run | `-d`, `-w`, optional `-c`, `-b`, `-p`, `-o`, checklist bounds/vars, `--lead-checklist-before-feature`, `--skip-tied-mcp-preflight` |
| Lead-only dry-run (2a) | `-d -c …` without `-b`, no `--prompts-file`, `--tdd-yaml`, `--verify-session`, argv after `--`, or `--non-compact-html` |
| Adherence reconcile | `adherence-reconcile` subcommand or standalone `--tracker` (required) with optional `--ledger`, `--gates-dir`, `--workspace`, `--citdp`, TIED indexes, `--include-process-grade` |

`scripts/run-feature-batch-agentstream.sh` builds `-d -w -c -p -b` (and optional `-o`); with `TIED_AGENTSTREAM_IMPL=ts` and a built `@tied/cli`, that dry-run shape is TS-native when other disqualifiers are absent.
- **`AGENTSTREAM`** — when set, path to a prebuilt Go `agentstream` executable (same as legacy shell scripts).

## Tests

Parity tests under `src/*.test.ts`: checklist tracker preview (Go oracle), tiedpreflight fixtures, executor dry-run (TS native vs Go oracle; `TIED_AGENTSTREAM_IMPL=ts` must not forward for qualified argv).
