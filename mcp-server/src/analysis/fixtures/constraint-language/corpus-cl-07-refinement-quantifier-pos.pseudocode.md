Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] CL-1 positive — case 12 length refinement provable on v2 path

procedure VALIDATE_POSITIVE:
  Contract:
    INPUT: items: list of int where length(items) > 0
    OUTPUT: first: int
    PRE: length(items) > 0
    POST: first is not null
    EFFECTS: pure
  IF length(items) > 0:
    first := items[0]
  RETURN first
