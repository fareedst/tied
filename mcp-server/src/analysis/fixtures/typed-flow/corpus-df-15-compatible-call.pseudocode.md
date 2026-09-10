# [REQ-PSEUDOCODE_TYPED_FLOW] Case 15: compatible CALL positive — no CALL_TYPE_MISMATCH (F6)

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
    INPUT: v: int
    OUTPUT: out: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL CALLEE( v )
