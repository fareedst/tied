# [REQ-PSEUDOCODE_TYPED_FLOW] Case 19: prose-only guard — no typed gate errors under promotion

procedure EXAMPLE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: x provided
    POST: y computed
    EFFECTS: pure
  x := input_value
  y := x
