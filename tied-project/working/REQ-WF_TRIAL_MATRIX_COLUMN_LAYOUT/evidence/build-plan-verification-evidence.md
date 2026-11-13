# Build-plan verification — REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT

**Date:** 2026-11-13  
**prompt_type:** build-plan

## Commands

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
```

## Results

- Unit: **15** tests, **0** failures (includes SC-WF-CMX-14, SC-WF-CMX-15)
- Builder `--check`: exit **0**
- Shim `--check`: exit **0**

## Product paths

- `tools/bootstrap/lib/wf-trial-comparison-matrix.mjs`
- `tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs`
- `tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs`
- `docs/demos/traditional-workflow-trial-runs-registry.md` (matrix section + footnote)
