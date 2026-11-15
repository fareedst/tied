# Test strategy — REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN

**Depth:** minimal · **Gate policy:** facilitator_doc_only

## Unit (`wf-trial-comparison-matrix.test.mjs`)

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-11 | Exactly **10** unique column headers after `grok47-low` manifest entry |
| SC-WF-CMX-14 | `MATRIX_COLUMNS` headers equal `localeCompare` sort; Claude block before Cursor |
| SC-WF-CMX-15 | `buildMatrixSection` footer row === header row |
| SC-WF-CMX-16 | `toolsetKeyFromMasterRow` for `grok-4.7-low-fast` + WF-09 grok47low readout → `cursor:grok47-low` |
| SC-WF-CMX-17 | That key is not `cursor:grok47-med` |
| SC-WF-CMX-18 | `grok-4.7-medium-fast` → `cursor:grok47-med` |
| SC-WF-CMX-19 | `grok47-low` header index immediately before `grok47-med` |

**Regression:** SC-WF-CMX-10…13 (effort headers, composer pivot), SC-WF-CMX-02…04 (cell format).

## Integration

| Command | Expect |
| --- | --- |
| `build-wf-trial-comparison-matrix.mjs --check` | Spot map includes WF-09 `cursor:grok47-low` / 1794608051 |
| `wf-trial-summaries-publish.mjs --check` | Matrix spot checks pass after regen |

No E2E — matrix is pure Markdown generation from master table.

## TDD order

Author failing tests for 16–19 and revised 11 **before** editing `configIdFromMasterRow` or `MATRIX_COLUMN_SPECS`.
