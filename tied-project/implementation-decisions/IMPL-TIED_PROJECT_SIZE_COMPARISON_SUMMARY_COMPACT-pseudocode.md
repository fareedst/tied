# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT]

Grammar-Version: v2

## Facilitator comparison display

- [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] Trim labels, prepare summary cohort rows, format cross-layer and wall_time in comparison markdown.

procedure TRIM_COMPARISON_DISPLAY_LABEL:
  Contract:
    INPUT: discover_basename string
    OUTPUT: display_label string
    PRE: basename from discover target label unchanged in manifest
    POST: when SUMMARY_LABEL_SUFFIX_RE matches, output is capture group else full basename
    EFFECTS: pure
  MATCH basename against /(wf-\d{2}-.+)$/i
  IF match THEN RETURN matched suffix
  RETURN basename

procedure PARSE_DISCOVER_EPOCH:
  Contract:
    INPUT: discover_basename string
    OUTPUT: epoch integer or null
    EFFECTS: pure
  DELEGATE parseEpochFromBasename from discover-clients module

procedure PREPARE_COMPARISON_SUMMARY_ROWS:
  Contract:
    INPUT: ok rows array, summaryEpochMin number
    OUTPUT: deduped sorted rows for Summary and verbose tables
    PRE: each row label is discover basename; receipt.ok true
    POST: each included row has parseEpochFromBasename label greater than summaryEpochMin when min positive
    POST: at most one row per trimComparisonDisplayLabel label; surviving row has max discover epoch per display label
    POST: output order matches sortSummaryRowsByDisplayLabel
    EFFECTS: pure
  FILTER rows where epoch null OR epoch less or equal summaryEpochMin THEN exclude
  GROUP remaining by TRIM_COMPARISON_DISPLAY_LABEL label
  FOR each group KEEP row with maximum discover epoch
  RETURN sortSummaryRowsByDisplayLabel grouped rows

procedure ORCHESTRATOR_WALL_TIME_SECONDS:
  Contract:
    INPUT: receipt object
    OUTPUT: seconds number or null
    POST: prefers receipt.trial_factors.orchestrator_wall_time_seconds when finite
    EFFECTS: read-only optional repo_root hydration when annex missing
  IF trial_factors.orchestrator_wall_time_seconds finite THEN RETURN that value
  OPTIONAL read wf-trial-orchestrator-run.v1.json under repo_root
  COMPUTE seconds from started_at and finished_at when both ISO-parseable
  RETURN null when unavailable

procedure RENDER_SUMMARY_ROW:
  Contract:
    INPUT: label, receipt ok true
    OUTPUT: markdown table row without ok column
    POST: cross-layer columns use CROSS_LAYER_DECIMALS 0
    POST: last column wall_time rounded integer or em dash
    EFFECTS: pure string format
  SET display TO TRIM_COMPARISON_DISPLAY_LABEL label
  SET wall TO ORCHESTRATOR_WALL_TIME_SECONDS receipt
  FORMAT oi/atom utf8/atom pf/atom as nearest integers
  EMIT Summary row with wall_time last column

procedure RENDER_VERBOSE_ROW:
  Contract:
    INPUT: label, receipt
    OUTPUT: expanded metrics row
    POST: first column uses same display_label as Summary; row list same as PREPARE output
    EFFECTS: pure
  SET display TO TRIM_COMPARISON_DISPLAY_LABEL label
  EMIT verbose row with repo tail and oi_hash
