Grammar-Version: v2

procedure VALIDATE_ITEMS:
  Contract:
    INPUT: items: list of Item where length(items) > 0
    OUTPUT: count: int
    PRE: true
    POST: count >= 0
    EFFECTS: pure
  RETURN count
