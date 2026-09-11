# [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]
procedure FIXTURE:
  # [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: Async
    TERMINATION: total
    RETRY: 2 attempts; timeout only; exponential backoff
    IDEMPOTENCY: request_id; POST: one DATA transition
    DATA: request_id
  AWAIT step_one
