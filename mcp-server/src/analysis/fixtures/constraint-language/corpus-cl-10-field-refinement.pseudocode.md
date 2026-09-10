Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-SHAPE-001 — record field refinement

procedure RECORD_FIELD:
  Contract:
    INPUT: user: { id: int, active: bool } where user.active = true
    OUTPUT: ok: bool
    PRE: user.active = true
    POST: ok = true
    EFFECTS: pure
  ok := true
  RETURN ok
