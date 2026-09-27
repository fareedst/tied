# [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [ARCH-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION] — stressor-residue.v1 structural validator and MCP hook.


Grammar-Version: v2

# [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [ARCH-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION]
# How: File-level contract INPUT where for constraint-enforced-v2; section bullet INPUT lines are assist-only.
Contract:
  INPUT: record: object | yaml_text: string
  OUTPUT: stressor-residue-validator.v1 report | parse error
  PRE: record is plain object after YAML parse when yaml_text supplied
  POST: on success, ok is true and diagnostics empty; on failure, ok is false with field-level diagnostics
  EFFECTS: pure (no IO except optional path read at MCP boundary)
  TERMINATION: total

## VALIDATE_STRESSOR_RESIDUE_RECORD

- [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [ARCH-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION] Validate minimum stressor-residue.v1 shape for discovery artifacts; does not prove runtime resilience.
- Contract:
  - INPUT: record object (already parsed) OR yaml_text string
  - PRE: schema_version when present must equal stressor-residue.v1
  - OUTPUT: { schema_version: stressor-residue-validator.v1, ok, proof_boundary, diagnostics[] }
  - POST:
    - on success, required nested fields present with non-empty strings where mandated
    - on failure, MISSING_FIELD or INVALID_ENUM diagnostic per row
  - FAILURE_MODES: InvalidYaml, WrongSchemaVersion, MissingRequiredField, InvalidResidueClass, InvalidDispositionStatus
  - EFFECTS: pure validation
  - TERMINATION: total
- PROCEDURE: VALIDATE_STRESSOR_RESIDUE_RECORD
  - 1. IF yaml_text THEN parse YAML to object ELSE use record
  - 2. Reject non-object root
  - 3. Require schema_version === stressor-residue.v1
  - 4. Require baseline.objective and baseline.naive_architecture_summary non-empty strings
  - 5. Require stressor.id, stressor.category, stressor.description non-empty strings
  - 6. Require impact_path object with at least one of functions, data, dependencies, bindings as non-empty array
  - 7. Require residue.description non-empty and residue.class in { desirable, harmful, finding, accepted_residual_risk, not_applicable, unresolved }
  - 8. Require evidence.proof_boundary non-empty string
  - 9. Require disposition.status in { unresolved, candidate_requirement, architecture_constraint, finding, accepted_residual_risk, not_applicable }
  - 10. WHEN disposition.tied_refs present THEN each entry must match REQ-|ARCH-|IMPL- prefix pattern
  - 11. RETURN report with proof_boundary "Discovery aid only; does not certify runtime behavior."
- How (sub-block, same token set): Validator never mutates project YAML or promotes worksheet rows to REQ authority.

## MCP_STRESSOR_RESIDUE_RECORD_VALIDATE

- [IMPL-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [ARCH-RESIDUALITY_STRESSOR_RECORD_VALIDATION] [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION] MCP tool wrapper accepting inline record or yaml_text.
- Contract:
  - INPUT: { record?: object, yaml_text?: string }
  - PRE: exactly one of record or yaml_text provided
  - OUTPUT: JSON text content of validator report
  - POST: same as VALIDATE_STRESSOR_RESIDUE_RECORD
  - EFFECTS: IO none beyond MCP framing
  - TERMINATION: total
- PROCEDURE: MCP_STRESSOR_RESIDUE_RECORD_VALIDATE
  - 1. CALL VALIDATE_STRESSOR_RESIDUE_RECORD
  - 2. RETURN JSON.stringify(report)
