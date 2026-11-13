# Test strategy — REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT

**Depth:** minimal · **Gate policy:** facilitator_doc_only

## Unit

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-14 | Header sort order + Claude-before-Cursor |
| SC-WF-CMX-15 | Footer row === header row in `buildMatrixSection` output |

Regression: SC-WF-CMX-10…13, SC-WF-CMX-04 cell contract.

## Integration

`tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check` and shim `build-comparison-matrix.mjs --check`.
