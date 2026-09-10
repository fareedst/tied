Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — record field refinement satisfied

procedure RECORD_FIELD_PASS:
  Contract:
    INPUT: user: User where user.active is defined
    OUTPUT: name: string
    PRE: user.active is defined
    POST: true
    EFFECTS: pure
  name := user
  RETURN name
