Grammar-Version: v2

# [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Positive control — immutable read without mutation violation

procedure IMMUTABLE_READ:
  Contract:
    INPUT: snapshot (immutable): Config
    OUTPUT: label: string
    PRE: true
    POST: true
    EFFECTS: pure
  label := snapshot
  RETURN label
