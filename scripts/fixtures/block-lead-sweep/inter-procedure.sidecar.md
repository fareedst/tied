# [IMPL-FIXTURE-INTER] [ARCH-FIXTURE-INTER] [REQ-FIXTURE-INTER]
# Summary: Fixture for inter-procedure block-lead normalization.

procedure FIRST:
  Contract:
    INPUT: none
    OUTPUT: ok
    PRE: true
    POST: ok
    EFFECTS: pure
    TERMINATION: total
  RETURN ok
# [IMPL-FIXTURE-INTER] [ARCH-FIXTURE-INTER] [REQ-FIXTURE-INTER] How: inter-procedure lead belongs to SECOND.
procedure SECOND:
  Contract:
    INPUT: none
    OUTPUT: ok
    PRE: true
    POST: ok
    EFFECTS: pure
    TERMINATION: total
  RETURN ok
