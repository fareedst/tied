# [IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] — Advisory independent_proofs validate

Grammar-Version: v2

## VALIDATE_CHECKER_ENVELOPE_PROOFS

- [IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] Scan independent_proofs[] and emit advisory warn gaps only.
procedure VALIDATE_CHECKER_ENVELOPE_PROOFS:
  # [IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] How: merge warn gaps before envelope gap counts; no foreign verifier execution
  Contract:
    INPUT: envelope document with optional independent_proofs[]
    PRE: envelope passed shape validation; schema_version request-evidence-envelope.v1
    OUTPUT: supplemental EnvelopeGap[] (severity warn)
    POST: no auto-promotion of review_status; no foreign verifier execution
    EFFECTS: pure advisory gap synthesis
    FAILURE_MODES: none blocking at minimal depth (warn only)
  FOR each proof IN envelope.independent_proofs:
    IF proof.proof_kind NOT IN KNOWN_INDEPENDENT_PROOF_KINDS:
      EMIT gap independent_proof_unknown_proof_kind (warn)
      CONTINUE
    IF proof.proof_kind == checker_backed_claim AND proof.proof_boundary is empty:
      EMIT gap independent_proof_missing_proof_boundary (warn)
  RETURN gaps
