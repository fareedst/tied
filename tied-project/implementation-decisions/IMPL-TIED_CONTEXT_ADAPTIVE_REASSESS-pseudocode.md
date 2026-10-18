# [IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] — reassessment receipts

Grammar-Version: v2

procedure REASSESS_CONTEXT_V1:
  Contract:
    INPUT: prior_profile, prior_receipt, new_profile
    PRE: prior_profile and new_profile validated; prior_receipt immutable
    OUTPUT: reassessment-receipt.v1
    POST:
      - success => prior_receipt bytes unchanged in output
      - success => action in unchanged|revise_plan|loop_back|stop_for_review
    EFFECTS: pure
    TERMINATION: total
  COMPARE dimension deltas material vs noise
  IF no material change THEN action unchanged
  IF increased risk THEN action loop_back OR stop_for_review per rules
  RETURN reassessment receipt with selection_delta
