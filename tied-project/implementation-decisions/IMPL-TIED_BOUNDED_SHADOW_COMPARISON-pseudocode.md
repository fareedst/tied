# [IMPL-TIED_BOUNDED_SHADOW_COMPARISON] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
# Opt-in advisory shadow comparison with selection_authority none.

Grammar-Version: v2

## Advisory shadow comparison

- [IMPL-TIED_BOUNDED_SHADOW_COMPARISON] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Deterministic candidate contrast without checklist or Tracker mutation.
- Contract:
  - INPUT: bounded candidate manifests, shadow-comparison.v1 options, pilot budget context
  - PRE: shadow opt-in flag true; manifests anonymizable; budget not exhausted
  - OUTPUT: shadow comparison report | error OptInRequired | error BudgetExhausted
  - POST:
    - on success: stable anonymized candidate ids, per-candidate evidence rows, optional advisory recommendation labeled; selection_authority none; gate_authority_unchanged true
    - on success: no tied_checklist_gate_validate mutation, no PRELOAD mutation, no finding promotion
  - FAILURE_MODES: OptInRequired, BudgetExhausted, RedactionFailure
  - EFFECTS: pure
  - TERMINATION: total

procedure RUN_SHADOW_COMPARISON(candidates, options):
  # [IMPL-TIED_BOUNDED_SHADOW_COMPARISON] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: emit advisory shadow report subordinate to TIED gates.
  Contract:
    INPUT: candidate manifest set, shadow options
    OUTPUT: shadow-comparison report descriptor | error OptInRequired | error BudgetExhausted
    PRE: schema_version shadow-comparison.v1 when serialized
    POST: deterministic tie handling; canary secrets redacted; proof_boundary default_off_opt_in_only
    FAILURE_MODES: OptInRequired, BudgetExhausted, RedactionFailure
    EFFECTS: pure
    TERMINATION: total
  IF shadow opt-in false: RETURN error OptInRequired
  IF pilot budget stop criteria or cost ceiling exhausted: RETURN error BudgetExhausted
  anonymize candidate identifiers deterministically
  compare bounded manifest fields; emit advisory recommendation when configured
  attach selection_authority none and gate_authority_unchanged true
  RETURN shadow comparison report descriptor
