# [REQ-PSEUDOCODE_TYPED_FLOW] Case 16: guarded nullable positive — no NULL_FLOW on guarded path (F3)

procedure EXAMPLE:
  Contract:
    INPUT: user: int | null
    OUTPUT: id: int
    PRE: true
    POST: true
    EFFECTS: pure
  IF user is not null:
    id := user + 1
  RETURN id
