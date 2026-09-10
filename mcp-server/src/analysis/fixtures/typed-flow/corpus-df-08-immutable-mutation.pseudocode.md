# [REQ-PSEUDOCODE_TYPED_FLOW] Case 08: immutable mutation (pilot) — expect unknown, not definite error

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
