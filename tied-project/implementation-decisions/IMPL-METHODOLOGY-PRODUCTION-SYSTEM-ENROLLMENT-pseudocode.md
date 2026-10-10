# [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [ARCH-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]

Grammar-Version: v2

## Summary contract
INPUT: methodology-learning-experiment.v1 record or yaml_text
PRE: W1 structural fields present when enrolling non-checklist_step surfaces
OUTPUT: ProductionSystemEnrollmentReport with enrollment_disposition
POST: enrolled only when surface_ref rules satisfied; checklist_step returns not_required
FAILURE_MODES: structural_invalid, ENROLLMENT_SURFACE_REF_REQUIRED, ENROLLMENT_INVALID_PROMPT_TYPE
EFFECTS: read-only validation; no store writes
TERMINATION: total

## VALIDATE_PRODUCTION_SYSTEM_ENROLLMENT
# [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] — Compose W1 validate then surface_ref enrollment rules.
Contract:
  INPUT: record | yaml_text (exactly one)
  OUTPUT: ProductionSystemEnrollmentReport
  PRE: record parses to mapping when yaml_text
  POST: ok true iff structural ok AND enrollment rules pass
  EFFECTS: none
  TERMINATION: total
  structural := VALIDATE_MLE_OBJECT(record)
  IF NOT structural.ok: RETURN structural_invalid
  IF surface == checklist_step: RETURN not_required ok true
  IF surface in {gate_policy, assurance_profile, prompt_type_workflow}:
    REQUIRE non-empty surface_ref
    IF surface == prompt_type_workflow: REQUIRE surface_ref in PROMPT_TYPE_LEAF_IDS
  RETURN enrolled ok true

## MCP_TOOL_SURFACE
# [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] — tied_methodology_production_system_enrollment_validate
Contract:
  INPUT: same as VALIDATE_PRODUCTION_SYSTEM_ENROLLMENT
  OUTPUT: JSON report
  PRE: registered in tools index
  POST: parity with unit tests
  EFFECTS: none
  TERMINATION: total
