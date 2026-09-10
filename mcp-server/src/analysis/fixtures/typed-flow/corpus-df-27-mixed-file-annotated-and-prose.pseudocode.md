# [REQ-PSEUDOCODE_TYPED_FLOW] Case 27: mixed file — errors only on annotated procedure

procedure ANNOTATED:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  x := "bad"

procedure PROSE_ONLY:
  Contract:
    INPUT: a
    OUTPUT: b
    PRE: a provided
    POST: b returned
    EFFECTS: pure
  a := input_value
  b := a
