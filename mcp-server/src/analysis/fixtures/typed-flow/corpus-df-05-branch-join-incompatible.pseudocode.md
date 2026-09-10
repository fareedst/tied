# [REQ-PSEUDOCODE_TYPED_FLOW] Case 05: branch join incompatible — expect JOIN_INCOMPATIBLE

procedure EXAMPLE:
  Contract:
    INPUT: flag: bool
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  IF flag:
    x := 1
  ELSE:
    x := "two"
  y := x + 1
