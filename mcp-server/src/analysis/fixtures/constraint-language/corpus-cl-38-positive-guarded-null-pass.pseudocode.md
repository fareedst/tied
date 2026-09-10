Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — guarded nullable refinement

procedure GUARDED_NULL_PASS:
  Contract:
    INPUT: value: int | null
    OUTPUT: result: int
    PRE: value is not null
    POST: true
    EFFECTS: pure
  IF value is not null:
    result := value
  RETURN result
