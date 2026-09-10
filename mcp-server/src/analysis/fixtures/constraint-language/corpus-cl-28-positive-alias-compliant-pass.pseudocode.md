Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — alias policy declared and respected

procedure ALIAS_COMPLIANT:
  Contract:
    INPUT: source: Buffer
    OUTPUT: view: Buffer
    ALIAS POLICY:
      - view may alias source
    PRE: true
    POST: true
    EFFECTS: pure
  view := source
  RETURN view
