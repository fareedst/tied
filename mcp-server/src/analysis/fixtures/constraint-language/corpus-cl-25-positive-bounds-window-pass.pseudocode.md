Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — scalar bounds window satisfied

procedure BOUNDS_PASS:
  Contract:
    INPUT: value: int where value >= 0 AND value <= 100
    OUTPUT: clipped: int where clipped >= 0 AND clipped <= 100
    PRE: value >= 0 AND value <= 100
    POST: clipped >= 0 AND clipped <= 100
    EFFECTS: pure
  clipped := value
  RETURN clipped
