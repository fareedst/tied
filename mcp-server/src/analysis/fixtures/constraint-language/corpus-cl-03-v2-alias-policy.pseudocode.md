Grammar-Version: v2

procedure ALIAS_EXAMPLE:
  Contract:
    INPUT: input: Buffer
    OUTPUT: output: Buffer
    ALIAS POLICY:
      - output may alias input
      - temp does not alias output
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN output
