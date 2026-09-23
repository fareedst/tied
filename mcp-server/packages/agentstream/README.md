# @tied/agentstream (Phase 3 strangler)

[IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]

## Implementation coverage

| Surface | Status |
| --- | --- |
| **Dispatcher** (`TIED_AGENTSTREAM_IMPL=go\|ts`) | Shipped via `@tied/cli` `tied agentstream` |
| **Go pipeline** (checklist run, executor, dry-run) | **Default** — exec `AGENTSTREAM` or `go run -C tools/agentstream ./cmd/agentstream` |
| **tiedpreflight** (static `.cursor/mcp.json` / `TIED_BASE_PATH`) | **TypeScript** — `src/tiedpreflight.ts` |
| **`--checklist-tracker-preview`** | **TypeScript** — `src/tracker-migration-preview.ts` (Phase 3b slice 1); parity vs Go on golden testdata |
| **Checklist render / pipeline / executor** | **Go only** (Phase 3b backlog, RISK-UNIFIED-001) |

## Environment

- **`TIED_AGENTSTREAM_IMPL`** — `go` (default) or `ts`. `go` spawns the Go binary directly. `ts` runs this package entry: **TS-native** for `--checklist-tracker-preview` (with `-c` / `--lead-checklist-yaml`); other flags **forward to Go** with a stderr `DIAGNOSTIC` line.
- **`AGENTSTREAM`** — when set, path to a prebuilt Go `agentstream` executable (same as legacy shell scripts).

## Tests

Parity tests under `src/*.test.ts`: checklist tracker preview (Go oracle), tiedpreflight fixtures, executor dry-run composition (Go oracle via `TIED_AGENTSTREAM_IMPL=go`).
