Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — list length refinement satisfied

procedure LIST_LENGTH_PASS:
  Contract:
    INPUT: items: list of int where length(items) > 0
    OUTPUT: head: int
    PRE: length(items) > 0
    POST: true
    EFFECTS: pure
  head := items[0]
  RETURN head
