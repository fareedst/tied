Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-4 — CALL without callee summary yields summary_missing unknown

procedure NO_SUMMARY:
  Contract:
    INPUT: a: int
    OUTPUT: b: int
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN b

procedure CALLER:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL NO_SUMMARY( x )
  RETURN y
