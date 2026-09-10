# [REQ-PSEUDOCODE_TYPED_FLOW] Case 09: RUN external — expect unknown with cause

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  RUN fetch_user_input
  y := x
