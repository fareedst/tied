Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Case 06: loop invariant partial — expect unknown/inconclusive, not definite constraint error

procedure LOOP_INVARIANT:
  Contract:
    INPUT: index: int where index >= 0
    DATA: items: list of int
    OUTPUT: result: int
    PRE: index >= 0
    POST: result >= 0
    EFFECTS: pure
  WHILE index > 0:
    index := index - 1
  result := index
  RETURN result
