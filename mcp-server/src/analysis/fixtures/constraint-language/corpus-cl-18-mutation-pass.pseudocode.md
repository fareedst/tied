Grammar-Version: v2

procedure READ_ONLY:
  Contract:
    INPUT: config (immutable): Config
    OUTPUT: value: string
    PRE: true
    POST: true
    EFFECTS: pure
  value := config
  RETURN value
