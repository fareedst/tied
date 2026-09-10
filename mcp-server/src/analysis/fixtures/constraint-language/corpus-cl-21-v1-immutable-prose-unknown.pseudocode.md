# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Case 21: v1 prose immutable — no MUTATION_VIOLATION without v2 tag

procedure EXAMPLE:
  Contract:
    DATA: config description prose immutable
    INPUT: timeout: int
    OUTPUT: ok: bool
    PRE: true
    POST: true
    EFFECTS: pure
  RUN apply_timeout(config, timeout)
  ok := true
  RETURN ok
