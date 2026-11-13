# Build-plan verification — REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS

**Date:** 2026-11-13  
**Slice:** SC-WF-CMX-01…06

## Commands

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs  → 6 pass
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check  → exit 0
```

## Spot

- Registry matrix preamble documents **wall_mins** + full **Grades**
- Sample cell WF-01 Cursor composer: `**19m**` + `3.87 · A/A−/…`
- Master **Run time** column unchanged (seconds)

## TIED

- Minted REQ/ARCH/IMPL + pseudocode sidecar
- CITDP: `tied-project/citdp/CITDP-REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS.yaml`
