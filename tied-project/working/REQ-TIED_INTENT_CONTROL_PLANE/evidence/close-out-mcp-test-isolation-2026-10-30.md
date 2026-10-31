# Close-out — MCP test path isolation (ad-hoc debug)

**Scope:** Test harness only (no production `yaml-loader` behavior change).

## Staging map

- `CHANGELOG.md`
- `mcp-server/scripts/run-mcp-tests.mjs`
- `mcp-server/src/test-helpers/client-path-env.ts`
- `mcp-server/src/yaml-loader.test.ts`
- `mcp-server/src/detail-loader-append.test.ts`
- `mcp-server/src/usage-metrics.test.ts`
- `mcp-server/src/project-identity.composition.test.ts`
- `mcp-server/src/tools/impl-pseudocode-mcp.test.ts`

## Excluded unrelated drift

Tracker/CITDP, source-graph indexes, fixture envelopes, config/identity YAML, workflow visualization handoff, untracked CITDP copies, root `project-identity.v1.yaml` — left unstaged.

## Verification

`cd mcp-server && npm test` — pass (2026-10-30).

## Git hygiene

MCP `tied_git_hygiene` `plan_close_out` preview `ok: true` (apply=false).

## Upstream feedback capture

N/A — test harness fix; no sponsor feedback ingest.

## Completion signals (ad-hoc)

- **Machine close-out:** not_run — no active `request_token` envelope for this debug slice
- **Process contract:** pass — full MCP test suite green
- **Adherence ledger:** not_run
- **Workspace cleanliness:** partial — scoped staging only; unrelated REQ WIP remains on disk
