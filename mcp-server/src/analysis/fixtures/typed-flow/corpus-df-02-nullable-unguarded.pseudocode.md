# [REQ-PSEUDOCODE_TYPED_FLOW] Case 02: nullable unguarded use — expect NULL_FLOW or unknown

procedure EXAMPLE:
  Contract:
    INPUT: y: int | null
    OUTPUT: z: int
    PRE: true
    POST: true
    EFFECTS: pure
  z := y
