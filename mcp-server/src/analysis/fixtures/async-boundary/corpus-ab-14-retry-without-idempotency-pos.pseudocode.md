# [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
    RETRY: 2 attempts
    ASYNC_BOUNDARY: await
  AWAIT step_one
