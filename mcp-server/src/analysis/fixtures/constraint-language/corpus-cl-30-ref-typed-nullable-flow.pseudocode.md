# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 02 — nullable unguarded (reference corpus)

procedure EXAMPLE:
  Contract:
    INPUT: y: int | null
    OUTPUT: z: int
    PRE: true
    POST: true
    EFFECTS: pure
  z := y
