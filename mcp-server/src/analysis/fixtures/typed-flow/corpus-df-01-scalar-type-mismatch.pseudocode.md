# [REQ-PSEUDOCODE_TYPED_FLOW] Case 01: scalar type mismatch — expect TYPE_MISMATCH

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  x := "hello"
