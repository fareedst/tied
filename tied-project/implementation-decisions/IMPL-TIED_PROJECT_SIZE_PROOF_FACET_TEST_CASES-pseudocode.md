# [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [ARCH-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]

Grammar-Version: v2

## Proof facet test cases

- [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [ARCH-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] Count node:test cases per classified file; bump validator_version to 1.1.0.
procedure COUNT_TEST_CASES_IN_SOURCE:
  Contract:
    INPUT: test source text
    OUTPUT: non-negative integer case count
    POST: counts it/test invocations after comment and naive string strip
    EFFECTS: pure
  STRIP block comments, line comments, string literals
  COUNT regex matches for it/test including only/skip/todo variants
  RETURN count

procedure APPLY_PROOF_FACET_CASE_COUNTS:
  Contract:
    INPUT: classified test file contents
    OUTPUT: tier bucket increments
    PRE: classifyTestFile unchanged from snapshot v1
    POST: proofCounts tiers sum cases not files
    EFFECTS: IO read-only
  FOR each globbed test file
    READ file text
    CLASSIFY path to tier
    INCREMENT tier BY COUNT_TEST_CASES_IN_SOURCE text
  SET validator_version TO 1.1.0 on receipt
