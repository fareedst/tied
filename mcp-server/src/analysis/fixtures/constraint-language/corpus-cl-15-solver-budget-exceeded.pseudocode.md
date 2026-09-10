Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-5 — interproc chain forces solver budget disclosure when capped low

procedure LEAF:
  Contract:
    INPUT: a: int
    OUTPUT: b: int
    SUMMARY RETURN:
      - ensures: b >= a
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN b

procedure MID:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL LEAF( x )
  RETURN y

procedure ROOT:
  Contract:
    INPUT: p: int
    OUTPUT: q: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL MID( p )
  RETURN q
