Grammar-Version: v2

procedure READ_CONFIG:
  Contract:
    INPUT: config (immutable): Config
    DATA: scratch (mutable): Buffer
    OUTPUT: value: string
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN value
