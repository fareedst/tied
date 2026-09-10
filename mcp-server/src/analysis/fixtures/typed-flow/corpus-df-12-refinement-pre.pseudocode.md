# [REQ-PSEUDOCODE_TYPED_FLOW] Case 12: unsupported refinement PRE — expect unknown with cause

procedure EXAMPLE:
  Contract:
    INPUT: items (list of int)
    OUTPUT: first: int
    PRE: length(items) > 0 && forall i in items: i.valid
    POST: first selected
    EFFECTS: pure
  IF length(items) > 0:
    first := items[0]
  RETURN first
