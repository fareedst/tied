# [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
procedure FIXTURE:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
    DATA: shared_buf
    ASYNC_BOUNDARY: await
  AWAIT mutate_shared
  AWAIT read_shared
