Grammar-Version: v2

procedure ALIAS_NO_POLICY:
  Contract:
    INPUT: x: int
    OUTPUT: result: int
    PRE: true
    POST: true
    EFFECTS: pure
  a := alias(x)
  b := alias(x)
  RUN mutate(a)
  result := b
