# [IMPL-TIED_BOUNDED_PILOT_BUDGET] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
# Validates default-off pilot budgets for bounded multi-run composition (Harness²-inspired accounting only).

Grammar-Version: v2

## Pilot budget validation

- [IMPL-TIED_BOUNDED_PILOT_BUDGET] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Pure schema gate for opt-in bounded runs; no execution or gate authority.
- Contract:
  - INPUT: raw pilot budget document candidate
  - PRE: document declares schema_version pilot-budget.v1; operator explicitly enabled bounded composition for the request
  - OUTPUT: normalized pilot budget | error InvalidPilotBudget | error OptInRequired
  - POST:
    - on success: k > 0; mode in {parallel, sequential}; seed stable; run_namespace unique within request scope; cost_ceiling and stop_criteria explicit; optional accounting_formula documents R=4k and P=3k without effectiveness claims
    - on error InvalidPilotBudget: no normalized budget emitted
    - on error OptInRequired: budget ignored when default-off flags absent
  - FAILURE_MODES: InvalidPilotBudget, OptInRequired, DuplicateNamespace
  - EFFECTS: pure
  - TERMINATION: total

procedure VALIDATE_PILOT_BUDGET(candidate):
  # [IMPL-TIED_BOUNDED_PILOT_BUDGET] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: reject invalid or non-opt-in budgets before any trajectory capture.
  Contract:
    INPUT: candidate budget map
    OUTPUT: normalized pilot budget | error InvalidPilotBudget | error OptInRequired | error DuplicateNamespace
    PRE: candidate is bounded map
    POST: success implies closed enumerations and positive k only
    FAILURE_MODES: InvalidPilotBudget, OptInRequired, DuplicateNamespace
    EFFECTS: pure
    TERMINATION: total
  IF bounded_composition opt-in flag is false: RETURN error OptInRequired
  IF schema_version is not pilot-budget.v1: RETURN error InvalidPilotBudget
  IF k <= 0 OR mode not in {parallel, sequential}: RETURN error InvalidPilotBudget
  IF seed missing OR run_namespace missing OR cost_ceiling missing OR stop_criteria missing: RETURN error InvalidPilotBudget
  IF run_namespace duplicates an active namespace for the same request_token: RETURN error DuplicateNamespace
  attach accounting_formula when present as declared formula only with proof_boundary harness2_mechanics_not_effectiveness
  RETURN normalized pilot budget
