Grammar-Version: v2

procedure MUTATION_EXAMPLE:
  Contract:
    INPUT: config (immutable): Config
    OUTPUT: ok: bool
    PRE: true
    POST: true
    EFFECTS: pure
  config := modified_value
  ok := true
  RETURN ok
