# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# Summary: Minimal sidecar for static analysis fixture corpus.

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
Contract:
  INPUT: sample data
  OUTPUT: analyzed result
  PRE: data provided
  POST: result returned
  EFFECTS: pure
  TERMINATION: total

procedure MAIN:
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: x is not null
    POST: y computed
    EFFECTS: pure
    TERMINATION: total
  x := input_value
  IF x > 0:
    CALL HELPER(x)
  ELSE:
    RETURN error failure
  RETURN y

procedure HELPER:
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: a
    OUTPUT: b
    PRE: a provided
    POST: b returned
    EFFECTS: pure
    TERMINATION: total
  WHILE a > 0:
    a := a - 1
  RETURN a
