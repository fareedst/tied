# [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] — Document upstream feedback capture outcome at close-out; forbid narrative-only store claims in client agent sessions.

Grammar-Version: v2

## Close-out capture outcome documentation

- [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] How: traceable-commit evidence must record upstream capture outcome or honest N/A before commit claims.
procedure VALIDATE_CAPTURE_OUTCOME_DOCUMENTED:
  Contract:
    INPUT: traceable_commit_evidence_markdown (string)
    PRE: close_out gate allowed OR sponsor documents blocker skip
    OUTPUT: validation_result with ok flag and missing_fields list
    POST:
      - ok => evidence contains upstream_capture_section OR documented N/A with reason
      - not ok => missing_fields names required subsection fields
    FAILURE_MODES: missing_section, N/A_without_reason
    EFFECTS: pure
    TERMINATION: total
  READ traceable_commit_evidence_markdown
  IF section "Upstream feedback capture outcome" absent THEN
    RETURN { ok: false, missing_fields: ["upstream_capture_section"] }
  IF section present AND value is N/A THEN
    IF reason field empty THEN
      RETURN { ok: false, missing_fields: ["N/A_reason"] }
  RETURN { ok: true, missing_fields: [] }

## Agent session narrative prohibition

- [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] How: bundled feedback skill and close-out cross-links forbid asserting store post without receipt in non-/feedback agent sessions.
procedure FORBID_NARRATIVE_UPSTREAM_CLAIM:
  Contract:
    INPUT: agent_session_context with sponsor_invoked_feedback_skill, claimed_upstream_post, optional receipt_id
    PRE: agent operates in TIED client workspace (not facilitator store-only ingest)
    OUTPUT: allowed_claim with narrative_post flag
    POST:
      - sponsor_invoked_feedback_skill => narrative_post may follow /feedback procedure with receipt
      - not sponsor_invoked_feedback_skill AND claimed_upstream_post AND receipt_id absent => narrative_post false
    EFFECTS: pure
    TERMINATION: total
  IF agent_session_context.sponsor_invoked_feedback_skill THEN
    RETURN { narrative_post: true when receipt_id present after MCP capture }
  IF agent_session_context.claimed_upstream_post AND receipt_id absent THEN
    RETURN { narrative_post: false }
  RETURN { narrative_post: false }

## Facilitator ingest mode documentation

- [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] How: record-gf-trial reference distinguishes client-originated rows, proxy store ingest, and --skip-feedback-ingest N/A.
procedure DOCUMENT_FACILITATOR_INGEST_MODES:
  # [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] How: publish ingest mode table in facilitator reference.
  Contract:
    INPUT: facilitator_readout_draft
    PRE: workspace is TIED store; subject client read-only unless sponsor scopes repair
    OUTPUT: documented_modes listing client_originated, proxy_store_row, skip_ingest_NA
    POST:
      - each mode has operator table row with example class (e.g. fb-mvnyr5n2-aaeg1j capture gap)
      - skip path states readout must not imply client receipt when ingest skipped
    EFFECTS: IO (markdown prose)
    TERMINATION: total
  EMIT table rows in record_gf_trial_skill_reference
  LINK witness feedback id fb-mvnyr5n2-aaeg1j as capture-gap class example
  RETURN documented_modes
