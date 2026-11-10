# Test strategy — [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) | Label trim, `prepareComparisonSummaryRows`, markdown Summary + verbose |
| [`project-size-comparison-render.test.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.test.mjs) | SC-CSC-01…10 contract tests |
| [`project-size-batch-compare.mjs`](../../../tools/bootstrap/lib/project-size-batch-compare.mjs) | `--summary-epoch-min`; manifest `options.summary_epoch_min` |
| [`project-size-discover-clients.mjs`](../../../tools/bootstrap/lib/project-size-discover-clients.mjs) | `parseEpochFromBasename` (imported by render) |
| [`snapshot-builder.ts`](../../../mcp-server/src/project-size/snapshot-builder.ts) | `trial_factors.orchestrator_wall_time_seconds` when `--include-trial-factors` |

## Unit tests — render (existing + v2)

### `trimComparisonDisplayLabel` / sort

Unchanged from v1 (WF disposable, `stdd-store`, synthetic).

### `prepareComparisonSummaryRows`

| ID | Case |
| --- | --- |
| SC-CSC-07 | `1794259000-wf-agentstream-wf-01-x` excluded; `1794259001-wf-agentstream-wf-01-x` included at min `1794259000` |
| SC-CSC-08 | Two ok rows, same trim, epochs A&lt;B → only B in output |
| SC-CSC-10 | `summaryEpochMin: 0` passes `stdd-store` / no-epoch labels |

### `renderComparisonMarkdown`

| ID | Asserts |
| --- | --- |
| SC-CSC-01 | Header 14 data columns + **wall_time** (15 headers total) |
| SC-CSC-02 / 03 | Trim and verbatim labels |
| SC-CSC-04 | Integer cross-layer cells |
| SC-CSC-09 | Last cell rounded wall time when `trial_factors.orchestrator_wall_time_seconds` set |
| Baseline | Proof boundary; no forbidden phrases |

**Fixture:** dogfood JSON + synthetic receipts with `trial_factors` and paired WF basenames.

## Snapshot builder

| Case | Assert |
| --- | --- |
| Wall from manifest | Fixture `wf-trial-orchestrator-run.v1.json` with known ISO pair → integer seconds on annex |

Run via existing mcp-server / project-size test harness if present; else minimal fixture test in bootstrap or `mcp-server` package test.

## Composition / E2E

Optional: one batch dry-run asserting manifest contains `summary_epoch_min`. Full regen is operator evidence, not CI gate.

## Security

Read-only render and snapshot; hydration reads orchestrator JSON only when repo exists.
