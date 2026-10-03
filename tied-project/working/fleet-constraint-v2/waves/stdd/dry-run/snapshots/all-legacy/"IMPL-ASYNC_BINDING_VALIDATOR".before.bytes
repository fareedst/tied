# [IMPL-ASYNC_BINDING_VALIDATOR] [ARCH-ASYNC_COMPOSITION_BINDING] [REQ-ASYNC_COMPOSITION_INVENTORY]
# Summary: Extend binding inventory validation for async seam columns and fault-pattern inventory (W5).

procedure ASYNC_BINDING_VALIDATOR_MAIN():
  # [IMPL-ASYNC_BINDING_VALIDATOR] [ARCH-ASYNC_COMPOSITION_BINDING] [REQ-ASYNC_COMPOSITION_INVENTORY]
  # How: Delegate to extended validateBindingInventory; proof boundary says binding exercised not race-free.
  Contract:
    INPUT: binding inventory rows with optional async_semantics, cancellation, idempotency_evidence
    OUTPUT: BindingInventoryReport
    PRE: rows is an array
    POST: async event/message rows have async_semantics; retry/at-least-once rows have idempotency evidence
    EFFECTS: pure
    TERMINATION: total
  1. CALL VALIDATE_BINDING_INVENTORY with rows
  2. RETURN report

procedure VALIDATE_BINDING_INVENTORY(rows):
  # [IMPL-ASYNC_BINDING_VALIDATOR] [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-ASYNC_COMPOSITION_BINDING] [REQ-ASYNC_COMPOSITION_INVENTORY]
  # How: Base IMPL-QUALITY_BINDING_INVENTORY checks plus W5 async seam rules.
  Contract:
    INPUT: binding inventory rows
    OUTPUT: binding validation report
    PRE: each row is an object candidate
    POST: diagnostics for duplicates, missing base fields, async rules, E2E justification
    EFFECTS: pure
    TERMINATION: total
  1. FOR each row:
  2.   RUN base duplicate and required-field checks (id, trigger, callee, arguments, effect, ordering, failure_behavior)
  3.   RUN composition_test or e2e_only platform constraint check
  4.   IF async_semantics present AND (ordering OR failure_behavior empty) THEN EMIT ASYNC_SEMANTICS_REQUIRES_ORDERING_FAILURE
  5.   IF trigger matches event OR message AND async_semantics empty THEN EMIT ASYNC_SEMANTICS_REQUIRED_FOR_EVENT_MESSAGE
  6.   IF failure_behavior OR async_semantics declares retry OR at-least-once AND no idempotency evidence THEN EMIT IDEMPOTENCY_EVIDENCE_REQUIRED
  7. RETURN report with proof_boundary binding exercised only; never race-free

procedure CONTROLLED_COMPOSITION_FAULT_PATTERNS():
  # [IMPL-ASYNC_BINDING_VALIDATOR] [ARCH-ASYNC_COMPOSITION_BINDING] [REQ-ASYNC_COMPOSITION_INVENTORY]
  # How: Document deterministic expected outcomes for UI-free composition fault injection; inventory validates row completeness not runtime.
  Contract:
    INPUT: fault pattern name
    OUTPUT: expected composition test outcome description
    PRE: pattern in {ordering_fault, timeout_fault, duplicate_delivery_fault}
    POST: each pattern names PRE violation, expected POST, and inventory columns exercised
    EFFECTS: pure
    TERMINATION: total
  1. ordering_fault: trigger before listener registered → handler not called; composition test fails closed
  2. timeout_fault: slow callee exceeds IMPL TIMEOUT → named failure mode; no partial success POST
  3. duplicate_delivery_fault: message delivered twice → idempotency POST asserts single DATA transition
  4. RETURN pattern catalog for composition-coverage.md and composition tests

# Proof boundary (mandatory): Binding inventory validation reports missing fields and documents composition test loci. It proves binding exercised in test design only; it does not certify runtime ordering, delivery guarantees, cancellation propagation, or race-freedom.
