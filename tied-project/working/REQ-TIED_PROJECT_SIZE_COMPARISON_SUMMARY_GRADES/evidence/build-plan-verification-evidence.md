# Build-plan verification — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES

**Date:** 2026-11-12  
**Slice:** **SC-CGR-01…06** — Summary **grades** column after `wall_clock`.

## Tests

```text
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
→ 19/19 pass (includes SC-CGR-02…05 + index smoke)

node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs
→ pass
```

## Regenerated cohort table

```bash
node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root "$PWD" --pattern wf-agentstream --limit 50 \
  --fine-labels --include-trial-factors \
  --summary-epoch-min 1794259000 \
  --out-dir tied-project/non-tied-plans/project-size-batch-discover-compare/evidence
```

Example joined row: `wf-10-cursor-grok47med` → `3.73 · A/A/A-/A-/B+/A-/A-`.

## Files touched

- `tools/bootstrap/lib/read-trial-readout-session-grading.mjs` (`buildTrialReadoutGradesIndex`)
- `tools/bootstrap/lib/project-size-comparison-render.mjs`
- `tools/bootstrap/lib/project-size-comparison-render.test.mjs`
- `tools/bootstrap/lib/project-size-batch-compare.mjs`
- `docs/demos/catalog-tied-size-and-trial-statistics.md`
- `tied-project/citdp/CITDP-REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES.yaml`

**Do next:** `@close-out` when sponsor ready.
