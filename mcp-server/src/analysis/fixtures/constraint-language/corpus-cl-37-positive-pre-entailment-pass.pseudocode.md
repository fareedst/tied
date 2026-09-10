Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — PRE entailment chain without violation

procedure PRE_ENTAIL_PASS:
  Contract:
    INPUT: base: int where base >= 0
    OUTPUT: next: int where next >= base
    PRE: base >= 0
    POST: next >= base
    EFFECTS: pure
  next := base
  RETURN next
