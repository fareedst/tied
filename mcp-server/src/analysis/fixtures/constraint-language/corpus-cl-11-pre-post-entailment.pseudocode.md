Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-PRE/POST partial positive — y >= x when y := x and x >= 0

procedure TRANSFER:
  Contract:
    INPUT: x: int where x >= 0
    OUTPUT: y: int
    PRE: x >= 0
    POST: y >= x
    EFFECTS: pure
  y := x
  RETURN y
