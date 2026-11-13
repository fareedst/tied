# Test strategy — REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS

**Depth:** minimal · **Gate policy:** advisory

## Unit tests

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-10 | Non-composer `MATRIX_COLUMNS` headers match `effort=low\|medium\|high`; composer header has no `effort=` |
| SC-WF-CMX-11 | Set of **9** headers has size 9 (no duplicates) |
| SC-WF-CMX-12 | Haiku baseline header exact string |
| SC-WF-CMX-13 | `toolsetKeyFromMasterRow` for composer slug + `composer25medium`/`high` readout paths → `cursor:composer-2.5` |

Regression: SC-WF-CMX-01…09, SC-WF-CMX-04 cell contract.

## Integration

`build-comparison-matrix.mjs --check` (SC-WF-CMX-04).

## Verification

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
```
