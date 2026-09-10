# [REQ-PSEUDOCODE_TYPED_FLOW] Case 06: loop mutation — expect unknown, not definite error

procedure EXAMPLE:
  Contract:
    INPUT: index: int
    DATA: items (list of int)
    OUTPUT: result: int
    PRE: true
    POST: true
    EFFECTS: pure
  WHILE index > 0:
    index := index - 1
    item := items[index]
  result := index
