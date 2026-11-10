# Build-plan verification — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT

**Date:** 2026-11-10 (v2 cohort)

## Commands

```bash
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
npx tsx --test mcp-server/src/project-size/project-size.test.ts
npm run build --prefix mcp-server
node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root . --include-store --include-trial-factors --summary-epoch-min 1794259000
# tied_validate_consistency → ok: true
```

## Results

- 10/10 render tests (SC-CSC-01…10 including prepare + wall_time)
- 7/7 project-size snapshot tests (orchestrator_wall_time_seconds fixture → 994s)
- Cohort `comparison-table.md` regenerated: 51 snapshots → 29 deduped Summary rows @ floor `1794259000`
- Manifest `options.summary_epoch_min` = `1794259000`; `include_trial_factors` true
- `tied_validate_consistency` ok: true

## Artifacts

- `tools/bootstrap/lib/project-size-comparison-render.mjs`
- `tools/bootstrap/lib/project-size-comparison-render.test.mjs`
- `tools/bootstrap/lib/project-size-batch-compare.mjs`
- `mcp-server/src/project-size/snapshot-builder.ts`
- `mcp-server/src/project-size/types.ts`
- `mcp-server/src/project-size/project-size.test.ts`
- `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md`
- `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/manifest.v1.json`
- `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/receipts/*.json`
