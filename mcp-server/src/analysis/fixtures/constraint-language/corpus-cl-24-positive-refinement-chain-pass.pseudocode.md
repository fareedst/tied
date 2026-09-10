Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — chained refinements proven without violation

procedure CHAIN_PASS:
  Contract:
    INPUT: start: int where start >= 0
    OUTPUT: end: int where end >= start
    PRE: start >= 0
    POST: end >= start
    EFFECTS: pure
  end := start + 1
  RETURN end
