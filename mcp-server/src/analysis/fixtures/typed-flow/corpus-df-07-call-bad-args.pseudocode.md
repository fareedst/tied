# [REQ-PSEUDOCODE_TYPED_FLOW] Case 07: CALL bad args — expect CALL_TYPE_MISMATCH

procedure CALLEE:
  Contract:
    INPUT: n: int
    OUTPUT: r: int
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN r

procedure CALLER:
  Contract:
    INPUT: v: string
    OUTPUT: out: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL CALLEE( "bad" )
