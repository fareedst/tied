# [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]
# N/A: pre-async-contract — untouched legacy-style block without optional async rows.
procedure LEGACY_SYNC:
  # [IMPL-ASYNC_PSEUDOCODE_GRAMMAR] [ARCH-ASYNC_CONTRACT_GRAMMAR] [REQ-ASYNC_PSEUDOCODE_CONTRACTS]
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: true
    POST: true
    EFFECTS: pure
    TERMINATION: total
  RETURN y
