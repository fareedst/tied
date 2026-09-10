# [REQ-PSEUDOCODE_TYPED_FLOW] Case 25: alias policy — aliasing remains unknown under Phase 3

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
