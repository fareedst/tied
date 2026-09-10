# [REQ-PSEUDOCODE_TYPED_FLOW] Case 03: collection element shape mismatch — expect SHAPE_MISMATCH

procedure EXAMPLE:
  Contract:
    DATA: items: list of { userId: int, name: string }
    INPUT: seed: int
    OUTPUT: id: int
    PRE: true
    POST: true
    EFFECTS: pure
  item := items[0]
  id := item.accountId
