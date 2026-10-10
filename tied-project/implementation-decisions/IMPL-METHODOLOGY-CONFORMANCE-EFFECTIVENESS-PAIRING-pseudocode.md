# [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]

Grammar-Version: v2

## Summary contract
INPUT: experiment_id and/or inline record plus optional conformance_evidence_refs
PRE: W1 experiment store available when resolving experiment_id
OUTPUT: MethodologyConformanceEffectivenessPairingReport
POST: trap disposition yields ok false; paired/inconclusive yields ok true when refs typed
FAILURE_MODES: INVALID_INPUT, experiment_not_found, generic_prose_ref, missing_outcome_link, process_grade_gap_required
EFFECTS: read-only except gate hook consumes report at verification/close_out
TERMINATION: total

## PAIR_CONFORMANCE_EFFECTIVENESS
# [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] — Pure pairing disposition logic.
Contract:
  INPUT: conformance_evidence_refs[], methodology_outcome_observation, process_grade_gap_documented, waiver
  OUTPUT: PairingReport with disposition enum
  PRE: refs must be typed maps or path strings; reject generic prose
  POST: conformance_only_trap when conformance without outcome link
  EFFECTS: none
  TERMINATION: total
  IF waiver valid: RETURN waived ok true
  PARSE typed conformance refs; IF generic prose: record diagnostic
  IF conformance present AND outcome missing: RETURN conformance_only_trap ok false
  IF outcome not_measured AND NOT process_grade_gap_documented: RETURN effectiveness_not_measured ok false
  ELSE RETURN paired ok true (including inconclusive outcome)

## PAIR_FROM_EXPERIMENT_ID
# [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [REQ-METHODOLOGY-LEARNING-EXPERIMENT] — Load W1 store row then PAIR.
Contract:
  INPUT: experiment_id, optional conformance_evidence_refs override, base_path
  OUTPUT: PairingReport with experiment_id
  PRE: experiment exists in methodology-experiments.yaml
  POST: delegates outcome fields from stored record
  EFFECTS: read store only
  TERMINATION: total

## METHODOLOGY_SURFACE_PAIRING_GATE
# [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — CITDP-scoped gate hook.
Contract:
  INPUT: citdp, phase verification|close_out, optional base_path
  OUTPUT: gate diagnostics methodology_pairing_blocked:* when trap
  PRE: methodology_surface_experiment_link absent => no-op allow
  POST: unlinked REQs unaffected
  EFFECTS: none (validator read-only)
  TERMINATION: total
  IF phase not verification/close_out: RETURN allow
  link := extractMethodologySurfaceExperimentLink(citdp)
  IF NOT link: RETURN allow
  report := PAIR_FROM_EXPERIMENT_ID(link)
  IF trap or NOT report.ok: RETURN block

## MCP_TOOL_SURFACE
# [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] — tied_methodology_conformance_effectiveness_pair
Contract:
  INPUT: experiment_id OR record plus optional refs
  OUTPUT: JSON PairingReport
  PRE: registered in tools index
  POST: no store writes
  EFFECTS: none
  TERMINATION: total
