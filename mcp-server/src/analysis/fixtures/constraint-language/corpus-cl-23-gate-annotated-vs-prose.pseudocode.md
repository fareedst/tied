Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Gate scoping — constraint errors only on constraint-annotated procedure

procedure ANNOTATED:
  Contract:
    INPUT: count: int
    OUTPUT: result: int where result >= 1
    PRE: true
    POST: result >= 1
    EFFECTS: pure
  result := 0
  RETURN result

procedure PROSE_ONLY:
  Contract:
    INPUT: a
    OUTPUT: b
    PRE: a provided
    POST: b returned
    EFFECTS: pure
  a := input_value
  b := a
