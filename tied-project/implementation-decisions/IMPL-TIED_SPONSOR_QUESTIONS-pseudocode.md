# [IMPL-TIED_SPONSOR_QUESTIONS] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [REQ-TIED_SPONSOR_QUESTIONS] — Costly-choice sponsor question extraction.

Grammar-Version: v2

## Sponsor questions

procedure EXTRACT_SPONSOR_QUESTIONS:
  # [IMPL-TIED_SPONSOR_QUESTIONS] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [REQ-TIED_SPONSOR_QUESTIONS] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] How: hinge validation, consequence ladder rung 3+, pending LEAP proposals; library imports only.
  Contract:
    INPUT: { project_root, citdp?: object, request_token?: string }
    OUTPUT: { questions: object[], hinge_diagnostics: string[], leap_pending: object[] }
    PRE: read-only
    POST: no TIED YAML writes
    EFFECTS: IO | pure
  IF citdp present THEN CALL validateHingeFields
  FOR EACH pending decision CALL classifyDecisionConsequence
  IF rung >= 3 THEN append sponsor question candidate
  CALL listProposals with status pending
  FILTER proposals needing sponsor charter
  RETURN structured questions

procedure REGISTER_TIED_SPONSOR_QUESTIONS_MCP:
  # [IMPL-TIED_SPONSOR_QUESTIONS] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [REQ-TIED_SPONSOR_QUESTIONS] How: tied_sponsor_questions MCP registration.
  Contract:
    INPUT: MCP args
    OUTPUT: JSON payload
    PRE: true
    POST: read-only
    EFFECTS: IO
  CALL EXTRACT_SPONSOR_QUESTIONS
  RETURN JSON
