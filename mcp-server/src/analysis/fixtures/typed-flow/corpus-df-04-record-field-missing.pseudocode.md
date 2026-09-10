# [REQ-PSEUDOCODE_TYPED_FLOW] Case 04: record field missing — expect SHAPE_MISMATCH

procedure EXAMPLE:
  Contract:
    INPUT: record: { name: string }
    OUTPUT: age: int
    PRE: true
    POST: true
    EFFECTS: pure
  age := record.age
