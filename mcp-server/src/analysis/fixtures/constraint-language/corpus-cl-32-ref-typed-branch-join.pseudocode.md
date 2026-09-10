# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 05 — branch join incompatible (reference corpus)

procedure EXAMPLE:
  Contract:
    INPUT: flag: bool
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  IF flag:
    x := 1
  ELSE:
    x := "two"
  y := x + 1
