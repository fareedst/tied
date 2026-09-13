# [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [ARCH-ASYNC_CHECKLIST_INTEGRATION] [REQ-ASYNC_CHECKLIST_CATALOG]
# Summary: Checklist async catalog table validation, contradiction routing, and async_in_scope Tracker disposition (W2).


Grammar-Version: v2

procedure ASYNC_CHECKLIST_DISPOSITIONS_MAIN():
  # [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [ARCH-ASYNC_CHECKLIST_INTEGRATION] [REQ-ASYNC_CHECKLIST_CATALOG]
  # How: Orchestrate impact-discovery async_in_scope, Phase B catalog-async-boundaries, and flag-async-contradictions routing.
  Contract:
    INPUT: tracker, impl_pseudocode_set: list where length(impl_pseudocode_set) >= 0, req_context
    OUTPUT: disposition_report
    PRE: W2 authorized; checklist MD/YAML include catalog-async-boundaries and flag-async-contradictions
    POST: every async-marked changed IMPL has closed catalog rows or blocking findings route to resolve-pseudocode
    EFFECTS: ReadOnly
    FAILURE_MODES: ASYNC_CATALOG_ROW_MISSING, ASYNC_CONTRADICTION_UNRESOLVED
    TERMINATION: total when disposition_report emitted
  1. CALL DETECT_ASYNC_IN_SCOPE with sponsor_text and impl_pseudocode_set
  2. WRITE tracker.async_in_scope and tracker.async_matched_semantic_classes
  3. IF tracker.async_in_scope THEN CALL VALIDATE_ASYNC_CATALOG_TABLE for each changed IMPL
  4. IF tracker.async_in_scope THEN CALL DETECT_ASYNC_CONTRADICTIONS across IMPL set
  5. FOR each finding WITH severity error: GOTO resolve-pseudocode before unit-test-red
  6. RETURN disposition_report

procedure DETECT_ASYNC_IN_SCOPE(input_text, impl_set):
  # [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] — How: Candidate trigger marker only — never activate inquiry from async_in_scope alone.
  Contract:
    INPUT: input_text, impl_set
    OUTPUT: async_in_scope, matched_semantic_classes
    PRE: impact-discovery step active
    POST: async_inquiry_activated remains false
    EFFECTS: ReadOnly
  1. IF any AWAIT, Promise OUTPUT, Async EFFECTS, SEND, or optional async row in scope THEN async_in_scope := true
  2. ELSE async_in_scope := false
  3. CLASSIFY matched_semantic_classes from seven documented classes
  4. RETURN async_in_scope, matched_semantic_classes

procedure VALIDATE_ASYNC_CATALOG_TABLE(pseudocode, catalog_rows):
  # [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] — How: One closed row per async block with eight columns from W2 table schema.
  Contract:
    INPUT: pseudocode, catalog_rows
    OUTPUT: catalog_validation_result
    PRE: async_in_scope true or IMPL declares async boundary
    POST: ok when every async block has closed row
    EFFECTS: ReadOnly
    ASYNC_BOUNDARY: structural
  1. FOR each async-marked block: REQUIRE row with Block, Boundary kind, Await/message/event, Timeout, Cancellation, Retry/idempotency, Shared DATA, Termination/order
  2. IF missing row THEN emit ASYNC_CATALOG_ROW_MISSING route catalog-async-boundaries
  3. RETURN catalog_validation_result

procedure DETECT_ASYNC_CONTRADICTIONS(impl_set, req_context, phase):
  # [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] — How: Deterministic flag-async-contradictions outcomes; typed AWAIT/Promise checks when evidence available.
  Contract:
    INPUT: impl_set, req_context, phase
    OUTPUT: contradiction_findings
    PRE: flag-insufficient-specs or flag-contradictory-specs invoked
    POST: findings route resolve-pseudocode before RED
    EFFECTS: ReadOnly
  1. FLAG AWAIT without Promise OUTPUT or Async EFFECTS when typed_evidence_available
  2. FLAG Async EFFECTS without boundary rationale
  3. FLAG SEQUENCING/CONTROL mismatch across caller/callee
  4. FLAG RETRY without IDEMPOTENCY; open wait without TERMINATION; REQ timeout vs IMPL TIMEOUT by phase
  5. RETURN contradiction_findings
