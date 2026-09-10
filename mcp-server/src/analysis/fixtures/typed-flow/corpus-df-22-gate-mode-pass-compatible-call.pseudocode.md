# [REQ-PSEUDOCODE_TYPED_FLOW] Case 22: gate_mode positive — compatible CALL under error promotion (F6 extended)

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
