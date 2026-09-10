# [REQ-PSEUDOCODE_TYPED_FLOW] Case 26: refinement policy — PRE refinement remains unknown under Phase 3

procedure EXAMPLE:
  Contract:
    INPUT: items (list of int)
    OUTPUT: count: int
    PRE: length(items) > 0 && forall i in items: i.valid
    POST: count returned
    EFFECTS: pure
  IF length(items) > 0:
    count := 0
  RETURN count
