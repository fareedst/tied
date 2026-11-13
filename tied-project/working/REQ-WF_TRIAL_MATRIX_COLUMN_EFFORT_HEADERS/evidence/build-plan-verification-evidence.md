# Build-plan verification — REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs  → 13 pass (SC-WF-CMX-10…13)
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs  → OK
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check  → exit 0
```

**Spot:** WF-01 composer column unnamed header; misdirected `composer25medium` readout `1794256930` in baseline column.
