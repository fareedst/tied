# [REQ-PSEUDOCODE_TYPED_FLOW] Case 20: gate_mode typed error — NULL_FLOW on annotated procedure

procedure EXAMPLE:
  Contract:
    INPUT: y: int | null
    OUTPUT: z: int
    PRE: true
    POST: true
    EFFECTS: pure
  z := y
