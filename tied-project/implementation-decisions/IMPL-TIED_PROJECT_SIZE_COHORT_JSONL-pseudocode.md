# [IMPL-TIED_PROJECT_SIZE_COHORT_JSONL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] — Append-only WF trial cohort JSONL.

Grammar-Version: v2

## Cohort JSONL append

- [IMPL-TIED_PROJECT_SIZE_COHORT_JSONL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Append one line via tooling only; policy changes use registry YAML.
procedure APPEND_WF_TRIAL_COHORT_RUN:
  # [IMPL-TIED_PROJECT_SIZE_COHORT_JSONL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Append one cohort JSONL row.
  Contract:
    INPUT: store_root, cohort_row merging snapshot layers and trial factors
    OUTPUT: appended line in runs.jsonl
    PRE: runs.jsonl exists or parent directory creatable
    POST: one newline-delimited JSON object appended
    EFFECTS: IO append
    FAILURE_MODES: INVALID_ROW_SHAPE
  VALIDATE cohort_row schema_version and proof_boundary echo
  APPEND prettyCanonicalJson row plus newline to tied-bundle/reports/wf-trial-cohort/runs.jsonl
