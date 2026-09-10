Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — interproc summary chain without violation

procedure INCREMENT:
  Contract:
    INPUT: n: int
    OUTPUT: out: int
    SUMMARY RETURN:
      - ensures: out >= n
    PRE: true
    POST: true
    EFFECTS: pure
  out := n + 1
  RETURN out

procedure PIPELINE:
  Contract:
    INPUT: seed: int where seed >= 0
    OUTPUT: result: int where result >= seed
    PRE: seed >= 0
    POST: result >= seed
    EFFECTS: pure
  CALL INCREMENT( seed )
  RETURN result
