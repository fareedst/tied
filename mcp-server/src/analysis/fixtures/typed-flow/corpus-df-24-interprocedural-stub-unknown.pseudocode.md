# [REQ-PSEUDOCODE_TYPED_FLOW] Case 24: interprocedural stub — cross-proc CALL without summary stays unknown

procedure REMOTE:
  Contract:
    INPUT: payload: string
    OUTPUT: result: int
    PRE: true
    POST: true
    EFFECTS: pure
  RETURN result

procedure CLIENT:
  Contract:
    INPUT: token: string
    OUTPUT: value: int
    PRE: true
    POST: true
    EFFECTS: pure
  CALL REMOTE( fetch_payload_from_runtime() )
