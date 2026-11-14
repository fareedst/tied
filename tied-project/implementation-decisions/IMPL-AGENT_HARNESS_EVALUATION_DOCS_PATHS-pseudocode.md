# IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS — essence pseudocode

<!-- [REQ-AGENT_HARNESS_EVALUATION_DOCS] [ARCH-AGENT_HARNESS_EVALUATION_DOCS] [IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS] -->

```text
PROCEDURE RESOLVE_AHE_PATHS(store_root)
  # [REQ-AGENT_HARNESS_EVALUATION_DOCS] [ARCH-AGENT_HARNESS_EVALUATION_DOCS] [IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS]
  # PRE: store_root is TIED store repository root
  # POST: returns absolute paths under docs/agent-harness-evaluation/
  RETURN map(AHE_ROOT, readouts, catalogs, registry, cohort, config, harness-eval)

PROCEDURE PROJECT_SIZE_BATCH_COMPARE_WRITE(store_root, out_evidence_dir, markdown)
  # [REQ-AGENT_HARNESS_EVALUATION_DOCS] [IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS]
  # EFFECTS: receipts under cohort/evidence/receipts; comparison-table at cohort/comparison-table.md
  WRITE out_evidence_dir/receipts/*
  WRITE resolveAhePaths(store_root).comparisonTable with markdown

PROCEDURE WF_TRIAL_READOUT_GLOB(store_root)
  # [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS]
  # POST: basenames from readoutsDir only
  RETURN readdir(resolveAhePaths(store_root).readoutsDir) FILTER trial-readout-PROMPT-WF-*
```