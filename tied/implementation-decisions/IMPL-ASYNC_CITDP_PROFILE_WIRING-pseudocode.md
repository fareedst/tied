# [IMPL-ASYNC_CITDP_PROFILE_WIRING] [ARCH-ASYNC_CITDP_EVIDENCE] [REQ-ASYNC_CITDP_TRIGGERS]
# Summary: CITDP candidate trigger derivation, evidence matrix, and inquiry activation contract (W3).


Grammar-Version: v2

procedure ASYNC_CITDP_PROFILE_WIRING_MAIN():
  # [IMPL-ASYNC_CITDP_PROFILE_WIRING] [ARCH-ASYNC_CITDP_EVIDENCE] [REQ-ASYNC_CITDP_TRIGGERS]
  # How: Consume W2 async_in_scope; emit candidate triggers and evidence rows; gate inquiry activation.
  Contract:
    INPUT: tracker, citdp, impl_pseudocode_set, req_context, composition_bindings
    OUTPUT: candidate_triggers, evidence_dispositions
    PRE: W2 exit evidence exists; async_in_scope disposition from impact-discovery
    POST: every matched trigger yields recorded disposition; inquiry never runs from marker alone
    EFFECTS: ReadOnly for derivation; WriteOnly for CITDP disposition rows when persisted
    FAILURE_MODES: ACTIVATION_DISPOSITION_MISSING, ASYNC_INQUIRY_UNAUTHORIZED
    TERMINATION: total when candidate_triggers and validation result emitted
  1. READ tracker.async_in_scope and tracker.async_matched_semantic_classes from W2
  2. IF NOT async_in_scope THEN RETURN empty candidate_triggers
  3. CALL DERIVE_ASYNC_CITDP_TRIGGERS with pseudocode, req_context, composition_bindings
  4. FOR each trigger: RECORD disposition row with profile_recommendation and evidence_attributes
  5. MAP evidence_attributes through ASYNC_CITDP_EVIDENCE_MATRIX for proof_boundary and minimum_acceptance
  6. RETURN candidate_triggers, evidence_dispositions

procedure DERIVE_ASYNC_CITDP_TRIGGERS(scope, pseudocode, req_context, bindings):
  # [IMPL-ASYNC_CITDP_PROFILE_WIRING] — How: Plan § W3 trigger table — candidate only; no tied_adversarial_inquiry_run.
  Contract:
    INPUT: async_in_scope, matched_semantic_classes, pseudocode, req_context, composition_bindings: list where length(composition_bindings) >= 0
    OUTPUT: candidate_triggers
    PRE: async_in_scope true
    POST: each trigger has candidate_only true
    DATA_TRANSITION: matched criteria append trigger descriptors to in-memory candidate_triggers only
    EFFECTS: ReadOnly
  1. IF Async EFFECTS or async boundary row THEN EMIT async-boundary-catalog profile recommendation
  2. IF SEND/IPC/event-handler binding THEN EMIT composition-async-seam test-strategy row
  3. IF retry or at-least-once criteria THEN EMIT retry-idempotency-evidence
  4. IF timeout or cancellation criteria THEN EMIT timeout-cancellation-evidence
  5. IF shared DATA crosses yield AND mutates persistence THEN EMIT stateful-reliability
  6. RETURN candidate_triggers

procedure VALIDATE_ASYNC_CITDP_ACTIVATION(inquiry_requested, disposition):
  # [IMPL-ASYNC_CITDP_PROFILE_WIRING] — How: Explicit activation contract before tied_adversarial_inquiry_run (D6).
  Contract:
    INPUT: async_in_scope, inquiry_requested, disposition
    OUTPUT: allowed, diagnostics
    PRE: W3 authorized
    POST: allowed true only when identity-bound disposition complete
    EFFECTS: ReadOnly
    FAILURE_MODES: async_in_scope_alone_does_not_authorize_inquiry
  1. IF NOT inquiry_requested THEN allowed := false; RETURN
  2. IF async_in_scope AND disposition missing THEN REJECT async_in_scope_alone_does_not_authorize_inquiry
  3. REQUIRE depth_tier, research_profile, assurance_profile, gate_policy
  4. REQUIRE matched_triggers, selected_cases from ASYNC-001..006, owner, expiry
  5. IF waiver present THEN REQUIRE waiver owner, expiry, rationale
  6. RETURN allowed, diagnostics

procedure ASYNC_EVIDENCE_MATRIX_LOOKUP(attribute):
  # [IMPL-ASYNC_CITDP_PROFILE_WIRING] [ARCH-ASYNC_CITDP_EVIDENCE] — How: return artifact, proof_boundary, minimum_acceptance for async attribute row.
  Contract:
    INPUT: attribute id
    OUTPUT: evidence_matrix_row | undefined
    PRE: attribute is one of nine W3 async attributes
    POST: row includes structural proof boundary only
    EFFECTS: ReadOnly
  1. LOOKUP ASYNC_CITDP_EVIDENCE_MATRIX by attribute
  2. RETURN evidence_matrix_row
