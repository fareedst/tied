# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 01 — scalar mismatch (reference corpus)

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  x := "hello"
