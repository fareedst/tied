Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Unsupported predicate — explicit unknown disclosure

procedure UNSUPPORTED:
  Contract:
    INPUT: data: string
    OUTPUT: out: string
    PRE: custom_predicate(data) === magic
    POST: true
    EFFECTS: pure
  RETURN data
