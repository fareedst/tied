# [IMPL-WF_TRIAL_SUMMARIES_PUBLISH] [ARCH-WF_TRIAL_SUMMARIES_PUBLISH] [REQ-WF_TRIAL_SUMMARIES_PUBLISH]

Grammar-Version: v2

## Publish WF trial summaries (cohort)

procedure PUBLISH_WF_TRIAL_SUMMARIES:
  # [IMPL-WF_TRIAL_SUMMARIES_PUBLISH] [ARCH-WF_TRIAL_SUMMARIES_PUBLISH] [REQ-WF_TRIAL_SUMMARIES_PUBLISH] Facilitator cohort regen from readouts; no positional args.
  Contract:
    INPUT: storeRoot, optional flags (dry_run, skip_size_batch, skip_registry_matrix)
    OUTPUT: updated registry, matrix, comparison-table; publish-summary evidence
    PRE: TIED_BASE_PATH is store tied-project
    POST: master registry grades refreshed from readouts where files exist; Latest recomputed
    EFFECTS: IO read readouts; write docs/demos and evidence paths
    FAILURE_MODES: matrix spot check fail; size batch discover parent missing (skip flag)
  LOAD catalog readout links
  GLOB trial-readout-PROMPT-WF-*.md
  EMIT orphan/missing diagnostics
  UNLESS skip_registry_matrix
    CALL REFRESH_REGISTRY_FROM_READOUTS
    CALL PATCH_REGISTRY_COMPARISON_MATRIX
  UNLESS skip_size_batch
  CALL project-size-batch-compare WITH include_trial_factors
  WRITE FACILITATOR-WF-PUBLISH evidence publish-summary.md
