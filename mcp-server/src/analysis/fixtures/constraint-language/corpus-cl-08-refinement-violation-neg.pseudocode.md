Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] POST refinement violation — count >= 1 but returns 0

procedure COUNT_NEGATIVE:
  Contract:
    INPUT: items: list of int
    OUTPUT: count: int
    PRE: true
    POST: count >= 1
    EFFECTS: pure
  count := 0
  RETURN count
