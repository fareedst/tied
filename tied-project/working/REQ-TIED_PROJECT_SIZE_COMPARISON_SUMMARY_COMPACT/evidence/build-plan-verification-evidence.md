# Build-plan verification — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT (v4)

**Date:** 2026-11-12  
**Slice:** **SC-CSC-12** — Summary atom columns **Vocab | REQ | ARCH | IMPL** after `label`.

## Tests

```text
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
→ 14/14 pass (includes SC-CSC-12 atom column order + column definitions order)
```

## Regenerated cohort table

```bash
node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root "$PWD" --pattern wf-agentstream \
  --fine-labels --include-store --include-trial-factors \
  --summary-epoch-min 1794259000 \
  --out-dir tied-project/non-tied-plans/project-size-batch-discover-compare/evidence
```

→ **51** snapshots; Summary header `| label | Vocab | REQ | ARCH | IMPL | …`.

## Files touched

- `tools/bootstrap/lib/project-size-comparison-render.mjs`
- `tools/bootstrap/lib/project-size-comparison-render.test.mjs`
- `tied-project/implementation-decisions/IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT-pseudocode.md`
- `tied-project/citdp/CITDP-REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT.yaml` (v4 desired_behavior via MCP)
- `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md` (generated)

**Do next:** `@close-out` when sponsor ready.
