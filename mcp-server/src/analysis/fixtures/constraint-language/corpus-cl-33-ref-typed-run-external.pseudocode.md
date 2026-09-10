# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 09 — RUN external (reference corpus)

procedure EXAMPLE:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  RUN fetch_user_input
  y := x
