# Test strategy — [REQ-TIED_PROJECT_SIZE_LAYERS]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `mcp-server/src/project-size/` | Build snapshot receipt from subject `repo_root` |
| Corpus compose | Delegate node/edge totals to existing corpus-graph indexer (read-only) |
| Operational intent | Aggregate `pseudocode_analyze` / parser IR counts + template mass |
| Proof facets | Classify tests under `src/**/*.test.ts` (stack-aware when `wf-trial-ts-node-test-v1`) |

## Unit tests (RED before production code)

Fixture: `mcp-server/test/fixtures/project-size/mini-client/` with 1 REQ, 1 IMPL sidecar, 2 unit tests.

| Test | Asserts |
| --- | --- |
| Atoms counts | Index key counts match fixture |
| Template mass | Applied lines < gross when sidecar includes contract boilerplate |
| Hash co-update | Change sidecar → `operational_intent_hash` changes |
| Proof facets | `unit_tests` count matches fixture files |
| Proof boundary | Receipt includes static non-authority string |

## Composition tests

- MCP tool `tied_project_size_snapshot` registered and returns `project-size-snapshot-receipt.v1`
- Optional: bootstrap doc contract that `record-wf-trial` reference mentions size layers appendix (follow-on slice 2)

## E2E

None — UI-free; facilitator dogfood is manual evidence in working folder.

## Security

Read-only scan of subject repo; no writes to subject `tied-project/*.yaml`.
