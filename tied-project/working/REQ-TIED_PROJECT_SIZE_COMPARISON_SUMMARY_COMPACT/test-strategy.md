# Test strategy — [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) | Label trim, `prepareComparisonSummaryRows`, markdown Summary + verbose |
| [`project-size-comparison-render.test.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.test.mjs) | SC-CSC-01…11 contract tests |
| [`project-size-batch-compare.mjs`](../../../tools/bootstrap/lib/project-size-batch-compare.mjs) | `--summary-epoch-min`; manifest `options.summary_epoch_min` |
| [`project-size-discover-clients.mjs`](../../../tools/bootstrap/lib/project-size-discover-clients.mjs) | `parseEpochFromBasename` (imported by render) |
| [`snapshot-builder.ts`](../../../mcp-server/src/project-size/snapshot-builder.ts) | `trial_factors.orchestrator_wall_time_seconds` when `--include-trial-factors` |

## Unit tests — render (v1 + v2 + v3)

### `trimComparisonDisplayLabel` / sort / prepare

Unchanged cases **SC-CSC-07…10**.

### `renderComparisonMarkdown`

| ID | Asserts |
| --- | --- |
| SC-CSC-01 | Summary has no `ok` column |
| SC-CSC-02 / 03 | Trim and verbatim labels |
| SC-CSC-04 | Integer cross-layer cells |
| SC-CSC-06 | Dogfood render; proof boundary |
| SC-CSC-09 | `wall_clock` last column (minutes) when trial_factors set |
| **SC-CSC-11** | Header matches `\| … \| e2e \| utf8/atom \| oi/atom \| pf/atom \| wall_clock \|`; data row with known `cross_layer` emits **utf8, oi, pf** in that order (e.g. `33, 3, 1` rounded) |

**v3 RED first:** update `SUMMARY_HEADER` regex before render green.

### Column definitions section

**SC-CSC-11:** definitions table lists **utf8/atom** before **oi/atom** before **pf/atom**.

**Fixture:** dogfood JSON + `minimalOkReceipt` with distinct `cross_layer` values for order assertion.

## Snapshot builder

Unchanged (v2 wall time annex).

## Composition / E2E

Regen `comparison-table.md` via batch CLI — operator evidence after v3 green.

## Security

Read-only render; no change in v3.

## Verification manifest

```text
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
node --test tools/bootstrap/lib/project-size-batch-compare.test.mjs
```
