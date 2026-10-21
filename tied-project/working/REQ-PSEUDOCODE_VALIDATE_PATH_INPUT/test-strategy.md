# Test strategy — REQ-PSEUDOCODE_VALIDATE_PATH_INPUT

**Traceability:** [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT] · [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] · [ARCH-PSEUDOCODE_INPUT_RESOLUTION]

## Module boundaries

| Module | Path | Validates independently |
| --- | --- | --- |
| Source resolver | `mcp-server/src/resolve-essence-pseudocode-source.ts` | Unit tests with temp `TIED_BASE_PATH` dirs |
| Path sandbox (existing) | `mcp-server/src/impl-pseudocode-input.ts` | Existing `impl-pseudocode-input.test.ts` — regression only |
| Layer B core (unchanged) | `mcp-server/src/analysis/pseudocode-validator.ts` | Existing tests — no new cases unless resolver integration |
| MCP validate handler | `mcp-server/src/tools/index.ts` | `pseudocode-validate-path-mcp.test.ts` (new) or extend quality-validation-mcp |

## RED cases (resolver unit)

| ID | Input | Expected |
| --- | --- | --- |
| R1 | Sponsor exact: `pseudocode_path` + token, file exists | `{ ok: true, content, sourceKind: "path" }` |
| R2 | `essence_pseudocode_path` only | Same as R1 |
| R3 | Token-only `IMPL-FIXTURE`, default sidecar file present | `sourceKind: "default_sidecar"` |
| R4 | Inline `pseudocode` only | `sourceKind: "inline"` |
| R5 | Inline + any path key | `AMBIGUOUS_INPUT` |
| R6 | Both `pseudocode_path` and `essence_pseudocode_path` | `AMBIGUOUS_INPUT` |
| R7 | Path escapes base (`../`) | `PATH_NOT_UNDER_TIED_BASE` or resolver error |
| R8 | Missing file | Read/not-found error |
| R9 | Token `REQ-FOO` only, no path | `MISSING_INPUT` (non-IMPL token) |
| R10 | Empty/whitespace `pseudocode`, no path, IMPL token, no default file | not-found or `MISSING_INPUT` per spec |
| R11 | Hyphenated IMPL token default sidecar | `IMPL-ATDD-E2E-AGENT_STREAM` style filename |

## RED cases (MCP integration)

| ID | Case | Expected |
| --- | --- | --- |
| M1 | Sponsor JSON via handler (no -32602) | `schema_version: layer-b-pseudocode-validator.v1` |
| M2 | Inline regression fixture from `quality-validation-mcp.test.ts` | Unchanged pass |
| M3 | `gate_mode: true` on path input | Gate fields applied same as inline |
| M4 | Update analyze coexistence test | Assert validate schema **additive**, not frozen |

## Composition / E2E

Not required — no UI; CLI replay is manual acceptance in PLAN.

## Security

- Path traversal via token or path args
- Reading symlinks outside base (inherit existing sandbox behavior)

## Commands (verification gate)

```bash
cd mcp-server && node --test src/resolve-essence-pseudocode-source.test.ts
cd mcp-server && node --test src/tools/pseudocode-validate-path-mcp.test.ts
cd mcp-server && node --test src/tools/quality-validation-mcp.test.ts
cd mcp-server && npx tsc -b
# from repo root after mint:
tied_validate_consistency
```
