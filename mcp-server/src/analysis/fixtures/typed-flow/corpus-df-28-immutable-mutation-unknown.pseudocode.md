# [REQ-PSEUDOCODE_TYPED_FLOW] Case 28: immutable mutation — remains unknown under Phase 3

procedure EXAMPLE:
  Contract:
    INPUT: items: list of int
    OUTPUT: count: int
    PRE: true
    POST: true
    EFFECTS: pure
  WHILE items not empty:
    items := tail(items)
  count := 0
