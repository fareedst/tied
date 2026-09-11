# [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
procedure CALLER:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: pure
  CALL ASYNC_CALLEE()
  AWAIT ASYNC_CALLEE
  RETURN y
procedure ASYNC_CALLEE:
  Contract:
    INPUT: a
    OUTPUT: b
    PRE: true
    POST: true
    EFFECTS: Async
    ASYNC_BOUNDARY: await
  AWAIT inner
