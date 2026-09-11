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
    DATA: session_id
    DATA_TRANSITION: unset → captured after first valid line
    SEQUENCING: capture session_id before wait_process
  AWAIT step_one
