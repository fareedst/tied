# [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: result: Promise of int
    PRE: true
    POST: true
    EFFECTS: Async
    ASYNC_BOUNDARY: await
  AWAIT step_one
