# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Typed-flow reuse case 03 — collection shape mismatch (reference corpus)

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
