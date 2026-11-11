# Build-plan verification — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK

**Date:** 2026-11-10

```bash
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
node tools/bootstrap/lib/project-size-batch-compare.mjs --store-root . --include-store --include-trial-factors --summary-epoch-min 1794259000
```

- 12/12 render tests (SC-CWC)
- wf-06-cursor-composer25high wall_clock **17** (was 994 seconds)
- `tied_validate_consistency` ok
