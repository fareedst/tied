# [REQ-PSEUDOCODE_TYPED_FLOW] Case 10: opaque IF condition — expect unknown with cause

procedure EXAMPLE:
  Contract:
    INPUT: user: string
    OUTPUT: granted: bool
    PRE: true
    POST: true
    EFFECTS: pure
  IF user is authorized for this resource and quota ok:
    granted := true
  RETURN granted
