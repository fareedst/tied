Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — CALL summary requirements satisfied

procedure HELPER:
  Contract:
    INPUT: payload: int
    OUTPUT: value: int
    SUMMARY CALL:
      - requires: payload >= 0
    PRE: true
    POST: true
    EFFECTS: pure
  value := payload
  RETURN value

procedure CALLER:
  Contract:
    INPUT: seed: int where seed >= 0
    OUTPUT: answer: int
    PRE: seed >= 0
    POST: true
    EFFECTS: pure
  CALL HELPER( seed )
  RETURN answer
