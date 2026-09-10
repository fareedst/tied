# [REQ-PSEUDOCODE_TYPED_FLOW] Case 23: gate_mode positive — guarded nullable under error promotion (F3 extended)

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
