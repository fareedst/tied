# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — v1 sidecar with constraint_flow must stay clean (CL-6)

procedure LEGACY_CLEAN:
  Contract:
    INPUT: x: int
    OUTPUT: y: int
    PRE: true
    POST: true
    EFFECTS: pure
  y := x
  RETURN y
