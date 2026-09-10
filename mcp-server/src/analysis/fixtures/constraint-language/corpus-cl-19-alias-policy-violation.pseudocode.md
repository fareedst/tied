Grammar-Version: v2

procedure ALIAS_VIOLATION_EXAMPLE:
  Contract:
    INPUT: input: Buffer
    OUTPUT: output: Buffer
    DATA: temp (mutable): Buffer
    ALIAS POLICY:
      - output may alias input
      - temp does not alias output
    PRE: true
    POST: true
    EFFECTS: pure
  temp := output
  RETURN output
