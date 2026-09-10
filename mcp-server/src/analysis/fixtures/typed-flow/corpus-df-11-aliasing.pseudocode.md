# [REQ-PSEUDOCODE_TYPED_FLOW] Case 11: aliasing not in model — expect unknown with cause

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: result: int
    PRE: true
    POST: true
    EFFECTS: pure
  a := alias(x)
  b := alias(x)
  RUN mutate(a)
  result := b
