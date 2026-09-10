Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] DF-CALL/RET positive — callee summary propagates to caller POST

procedure BUMP:
  Contract:
    INPUT: n: int
    OUTPUT: result: int
    SUMMARY CALL:
      - requires: n >= 0
    SUMMARY RETURN:
      - ensures: result >= n
    PRE: true
    POST: true
    EFFECTS: pure
  result := n + 1
  RETURN result

procedure RUN:
  Contract:
    INPUT: value: int where value >= 0
    OUTPUT: answer: int
    PRE: value >= 0
    POST: answer >= value
    EFFECTS: pure
  CALL BUMP( value )
  RETURN answer
