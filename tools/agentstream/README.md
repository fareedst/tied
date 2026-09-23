# Go agentstream (removed)

The Go `tools/agentstream/` tree was **removed in Phase 4d** ([REQ-TIED_UNIFIED_TOOLCHAIN](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/PLAN.md)).

**Operators:** use **`tied agentstream`** (TypeScript `@tied/agentstream` via `@tied/cli`). Build with `cd mcp-server && npm run build`.

**Emergency legacy Go:** checkout a git tag recorded in [phase4d-go-oracle-freeze.json](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4d-go-oracle-freeze.json) — see [phase4c-deprecation-notice.md](../../working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4c-deprecation-notice.md).

**Tests / fixtures:** golden checklist data lives under `mcp-server/packages/agentstream/testdata/`.
