Grammar-Version: v2

procedure MIXED_V2:
  Contract:
    INPUT: user_id: int
    INPUT: session description prose field
    OUTPUT: result: string
    DATA: cache metadata prose
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN result
