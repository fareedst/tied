# Test strategy — REQ-WF_TRIAL_MATRIX_CLAUDE_EFFORT_TIERS

**Depth:** minimal · **Gate policy:** facilitator_doc_only

## Unit (`wf-trial-comparison-matrix.test.mjs`)

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-11 | Exactly **13** unique column headers after Claude tier generator |
| SC-WF-CMX-14 | `MATRIX_COLUMNS` headers equal `localeCompare` sort; Claude block before Cursor |
| SC-WF-CMX-15 | `buildMatrixSection` footer row === header row |
| SC-WF-CMX-20 | Sonnet medium readout → `claude:claude-sonnet-5-5@medium` (regression) |
| SC-WF-CMX-21 | Sonnet medium header present (regression) |
| SC-WF-CMX-22 | Sonnet high readout (`1794411691` path token) → `claude:claude-sonnet-5-5@high` |
| SC-WF-CMX-23 | Haiku high readout (`1794409094` path token) → `claude:claude-haiku-5-5@high` |
| SC-WF-CMX-24 | Headers `Claude · claude-haiku-5-5 effort=high` and `Claude · claude-sonnet-5-5 effort=high` |
| SC-WF-CMX-26 | Export `claudeEffortColumnSpecs` or test helper: simulate manifest without `@medium`; `toolsetKeyFromMasterRow` → `null` for medium readout |

**Regression:** SC-WF-CMX-10…13, 16–19 (grok47, composer, cell format), SC-WF-CMX-07–09 (Haiku low).

## Integration

| Command | Expect |
| --- | --- |
| `build-wf-trial-comparison-matrix.mjs --check` | WF-10 `claude:claude-sonnet-5-5@high` / 1794411691; WF-10 `claude:claude-haiku-5-5@high` / 1794409094 |
| `wf-trial-summaries-publish.mjs --check` | Matrix spot checks pass after regen |

No E2E — matrix is Markdown generation from master table.

## TDD order

Author failing tests for **11 (count 13), 22–26** and builder spot-check updates **before** `claudeEffortColumnSpecs()` and `toolsetKeyFromMasterRow` fallback removal.

## SC-WF-CMX-25 (manual / post-regen)

Inspect regenerated registry matrix: WF-01…08 Sonnet **low** column must not link `claudesonnet55medium` readouts; those appear under **effort=medium** column only.