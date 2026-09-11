# [IMPL-FIXTURE-EXTERNAL] [ARCH-FIXTURE-EXTERNAL] [REQ-FIXTURE-EXTERNAL]
# Summary: Fixture for external-only block-lead normalization.

# [IMPL-FIXTURE-EXTERNAL] [ARCH-FIXTURE-EXTERNAL] [REQ-FIXTURE-EXTERNAL] How: external lead must move inside procedure body.
procedure MAIN:
  Contract:
    INPUT: none
    OUTPUT: ok
    PRE: true
    POST: ok
    EFFECTS: pure
    TERMINATION: total
  RETURN ok
