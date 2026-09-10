# [REQ-PSEUDOCODE_TYPED_FLOW] Case 13: mixed typed+prose contract — F1b all fields retained

procedure MIXED:
  Contract:
    INPUT: user_id: int
    INPUT: session description prose field
    OUTPUT: result: string
    DATA: cache metadata prose
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN result
