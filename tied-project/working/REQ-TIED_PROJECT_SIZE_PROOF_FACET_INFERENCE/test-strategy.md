# Test strategy — REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE

**Depth:** minimal · **Gate policy:** advisory

## Fixtures

| Fixture | Expected labels (illustrative) |
| --- | --- |
| WF-09 monolith-like | `unit.default` >> 0; `composition.wiring` ≈ 0 inferred |
| WF-10 medium-like | `composition.wiring` or `composition.integration` > 0; `label_case_counts` matches facilitator scan |

## Unit tests

| Area | Asserts |
| --- | --- |
| Rollup invariant | Σ `label_case_counts` = unit + comp + e2e + binding_inventory case totals |
| Header override | `PROOF_LABEL` changes subtype, not facet receipt keys incorrectly |
| Inference | Inferred binding does not add to `composition_tests` |

## Regression

- 1.1.0 receipts unchanged when requesting snapshot without fine-label era (if dual-mode supported) OR explicit version flag in builder tests.

## E2E

Batch compare CLI with `--fine-labels` on archived receipts.
