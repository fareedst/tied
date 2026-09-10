# [REQ-PSEUDOCODE_TYPED_FLOW] Case 18: gate_mode typed error — TYPE_MISMATCH on annotated procedure

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  x := "hello"
