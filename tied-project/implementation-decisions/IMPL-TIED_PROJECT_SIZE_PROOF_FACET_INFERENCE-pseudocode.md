# [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [ARCH-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE]

Grammar-Version: v2

## COLLECT_LABEL_CASE_COUNTS

- [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [ARCH-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] Roll up proof_subtype case counts at validator_version 1.2.0 without changing coarse facet path rules.
procedure COLLECT_LABEL_CASE_COUNTS:
  Contract:
    INPUT: test file paths and sources
    OUTPUT: label_case_counts map, composition_inferred_cases
    PRE: coarse facets use classifyTestFile only
    POST: sum(label_case_counts) equals sum of four facet case totals
    EFFECTS: read-only
  FOR each test file
    COUNT cases
    ACCUMULATE coarse facet by path classify only
    RESOLVE subtype via PROOF_LABEL then PROOF_KIND then path fine classify
    ACCUMULATE label_case_counts[subtype] BY cases
    IF binding heuristic AND coarse is unit
      INCREMENT composition_inferred_cases BY cases
      APPEND proof_inference_diagnostics when non-empty
  SET validator_version TO 1.2.0
