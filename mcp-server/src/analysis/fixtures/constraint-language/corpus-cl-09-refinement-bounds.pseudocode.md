Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-COLL-001 — collection bounds via length(items) > 0

procedure NON_EMPTY_LIST:
  Contract:
    INPUT: items: list of Item where length(items) > 0
    OUTPUT: result: int
    PRE: length(items) > 0
    POST: result >= 0
    EFFECTS: pure
  result := 0
  RETURN result
