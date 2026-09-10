# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 10 — opaque IF condition (reference corpus)

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
