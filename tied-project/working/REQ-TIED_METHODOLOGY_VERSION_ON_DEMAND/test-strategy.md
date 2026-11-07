# Test strategy — REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND

**Proof boundary:** Static tests + loader manual spot-check. No runtime LLM evaluation.

## Unit

| Target | RED intent | GREEN assert |
|--------|------------|--------------|
| `mcp-server/src/server-info/server-info.test.ts` | Snapshot lacks `extensions.tied.methodology` | Ajv-valid payload; `version` matches fixture `VERSION`; `source` set |
| `mcp-server/src/tied-methodology-version.test.ts` | (existing) | No regression; if provenance helper added, new cases per source |
| `scripts/conversation-adherence-score.test.mjs` | `response_stamp_present` flags missing stamp | After change: `flagged` false OR `severity: warn` and excluded from error rollup |

## Composition / contract

| Target | Assert |
|--------|--------|
| `mcp-server/src/e2e/prompt-type-subagent.test.ts` | All 13 agent wrappers reference `server_info` (and/or `tied.methodology`) instead of `/TIEDv\d+\.\d+\.\d+:/` |
| `node --test dist/e2e/prompt-type-subagent.test.js` | Same after `npm run build` in mcp-server |

## Fixtures

- Update or add under `scripts/fixtures/conversation-adherence/` only if dimension semantics change (warn-only documentation).
- Update `mcp-server/contracts/server_info/server_info.response.example.json` with sample extension.

## TIED / process

- `pseudocode_validate` for `IMPL-TIED_METHODOLOGY_VERSION_ON_DEMAND` (+ LEAPed IMPL slices if any).
- `tied_validate_consistency` after index/detail writes.
- `lint_yaml` on changed `tied-project/**/*.yaml`.

## Manual (operator)

1. Open fresh agent chat in this repo; confirm first line is **not** `TIEDv…:` when loaders updated.
2. Call MCP `server_info`; confirm `extensions.tied.methodology.version` equals root `VERSION`.

## Non-goals

- No new E2E UI Task invocation tests.
- No change to envelope/fidelity tests except if provenance refactor shares code path (regression only).
