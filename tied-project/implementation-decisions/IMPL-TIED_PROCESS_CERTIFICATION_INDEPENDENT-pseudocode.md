# [IMPL-TIED_PROCESS_CERTIFICATION_INDEPENDENT] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS] [REQ-TIED_PROCESS_CERTIFICATION_READINESS] — independent assessment

Grammar-Version: v2

procedure VALIDATE_INDEPENDENT_ASSESSMENT_V1:
  Contract:
    INPUT: recordPath path, authorIdentity string
    PRE: record file exists
    OUTPUT: validated independent-assessment-record.v1
    POST:
      - success => assessor identity distinct from author/implementer
      - success => independence attestation present
    EFFECTS: read-only filesystem
    FAILURE_MODES: INSUFFICIENT_INDEPENDENCE
    TERMINATION: total
  LOAD record from disk
  IF assessor_id equals authorIdentity THEN FAIL INSUFFICIENT_INDEPENDENCE
  IF attestation missing THEN FAIL INSUFFICIENT_INDEPENDENCE
  RETURN record

procedure BUILD_ASSESSOR_AGREEMENT_REPORT_V1:
  Contract:
    INPUT: records list of independent-assessment-record.v1
    PRE: at least two records
    OUTPUT: assessor-agreement-report.v1
    POST: agreement rates deterministic for sorted finding ids
    EFFECTS: pure
    TERMINATION: total
  COMPARE findings pairwise with stable ordering
  RETURN agreement report
