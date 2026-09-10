Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-16 — conflicting SUMMARY RETURN declarations emit SUMMARY_CONFLICT

procedure CONFLICTED:
  Contract:
    INPUT: n: int
    OUTPUT: out: int
    SUMMARY RETURN:
      - ensures: out >= 1
    SUMMARY RETURN:
      - ensures: out <= 0
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN out
