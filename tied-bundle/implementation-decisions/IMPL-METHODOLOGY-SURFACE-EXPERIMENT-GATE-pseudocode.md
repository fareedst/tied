# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]

Grammar-Version: v2

## Summary contract
INPUT: citdp, phase, optional base_path
PRE: CITDP is a mapping when present
OUTPUT: gate ok flag and stable diagnostics
POST: legacy when class absent or none; block when class non-none without link/store/hypothesis/baseline
FAILURE_MODES: unknown_change_class, missing_link, experiment_not_found, w1_validation_failed, missing_baseline
EFFECTS: read-only store access
TERMINATION: total

## READ_METHODOLOGY_SURFACE_CHANGE_CLASS
# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE] — Pure CITDP read; no path inference.
Contract:
  INPUT: citdp root mapping
  OUTPUT: closed enum or sentinel none / unknown
  PRE: read change_definition.methodology_surface_change_class only
  POST: absent field maps to none; unknown string maps to unknown sentinel
  EFFECTS: none
  TERMINATION: total

## EXTRACT_METHODOLOGY_SURFACE_EXPERIMENT_LINK
# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE] — Shared W2 extractor semantics.
Contract:
  INPUT: citdp
  OUTPUT: link block or undefined
  PRE: delegate to pairing-gate candidate paths
  POST: same shape as W2 pairing
  EFFECTS: none
  TERMINATION: total

## LOAD_AND_VALIDATE_W1_EXPERIMENT
# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
Contract:
  INPUT: experiment_id, base_path
  OUTPUT: validated record or diagnostics
  PRE: store readable
  POST: missing row yields methodology_experiment_not_found:{id}; propagate W1 validator codes
  EFFECTS: read store only
  TERMINATION: total

## VALIDATE_METHODOLOGY_SURFACE_PRE_IMPLEMENTATION_GATE
# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE] — Fail-closed pre_impl hook.
Contract:
  INPUT: citdp, phase, base_path
  OUTPUT: ok and diagnostics methodology_surface_experiment_gate_blocked:*
  PRE: phase pre_implementation only; waiver shape aligned with W2 link waiver when present
  POST: class none or absent allows; class non-none requires link, store row, hypothesis, non-empty baseline
  EFFECTS: none
  TERMINATION: total
  IF phase != pre_implementation: RETURN allow
  class := READ_METHODOLOGY_SURFACE_CHANGE_CLASS
  IF class == none: RETURN allow
  IF class == unknown: RETURN block unknown_change_class
  link := EXTRACT_METHODOLOGY_SURFACE_EXPERIMENT_LINK
  IF NOT link: RETURN block missing_link
  record := LOAD_AND_VALIDATE_W1_EXPERIMENT(link.experiment_id)
  IF NOT record.ok: RETURN block with W1 codes
  IF baseline empty: RETURN block missing_baseline

## METHODOLOGY_SURFACE_EXPERIMENT_GATE_COMPOSITION
# [IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
Contract:
  INPUT: phase, citdp, basePath in validateChecklistGate
  OUTPUT: merged diagnostics before W2 pairing hook
  PRE: invoke VALIDATE_METHODOLOGY_SURFACE_PRE_IMPLEMENTATION_GATE immediately before validateMethodologySurfacePairingGate
  POST: W2 verification/close_out ordering unchanged
  EFFECTS: read-only diagnostics only
  TERMINATION: total
