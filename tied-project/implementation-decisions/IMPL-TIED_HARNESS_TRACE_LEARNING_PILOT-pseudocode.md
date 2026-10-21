# [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] — Loop 3 HTOL learning experiment charter, templates, dogfood enrollment, pilot evidence.

Grammar-Version: v2

## SLICE_A_AUTHOR_LEARNING_CHARTER

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] Author methodology charter for sponsor-run HTOL effectiveness pilots with proof boundary, hypothesis template, baseline, stop criteria, operator sequence.
- Contract:
  - INPUT: PLAN slice A; incident-revert evaluation corpus pilot bounds pattern; Phase 1 HTOL guide cross-links
  - PRE: refine-plan pre_implementation gate allowed
  - OUTPUT: tied-bundle/docs/harness-trace-learning-experiment-charter.md | { error: missing_required_section }
  - POST: Charter states pilot does not replace gates; vendor metrics LangChain-reported or not_measured
  - EFFECTS: No MCP behavior change

## SLICE_B_AUTHOR_TEMPLATES

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] Add fillable YAML examples for methodology-learning-experiment.v1 row and PilotSpec for tied_feedback_pilot_run.
- Contract:
  - INPUT: Closed-catalog metrics from feedback-to-tied.md; CITDP methodology_surface_experiment_link fields
  - PRE: Charter draft stable enough for template cross-references
  - OUTPUT: tied-bundle/templates/htol-methodology-learning-experiment.v1.example.yaml and htol-feedback-pilot-spec.v1.example.yaml
  - POST: Templates reference surface_ref harness-trace-review and operator_local default privacy tier

## SLICE_C_DOGFOOD_ENROLLMENT

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] Upsert store dogfood experiment via tied_methodology_learning_experiment_upsert; persist validate/list/enrollment advisory evidence JSON.
- Contract:
  - INPUT: experiment_id mle-htol-pilot-20261021-001; production_system_surface prompt_type_workflow; surface_ref harness-trace-review
  - PRE: TIED_BASE_PATH verified; tied_config_get_base_path matches active repo tied-project
  - OUTPUT: methodology-experiments.yaml row | { error: validate_failed }
  - POST: methodology_outcome_observation initial value not_measured; proof_boundary explicit
  - FAILURE_MODES: WrongBasePath, ValidateRejected, HandEditBypass

## SLICE_D_FEEDBACK_PILOT_RUN

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] Run tied_feedback_pilot_run once; persist feedback-pilot.v1 report; update outcome observation to inconclusive or not_measured only.
- Contract:
  - INPUT: htol-feedback-pilot-spec template; compatibility_key feedback-capture.v1|operator_local unless htol-v1 cohort exists
  - PRE: Slice C enrollment persisted
  - OUTPUT: working/evidence/htol-feedback-pilot-report.v1.json | { error: stop_criteria_triggered }
  - POST: Zero cohort documented as expected initial state in charter evidence narrative
  - EFFECTS: analysis_only; no methodology YAML promotion

## SLICE_E_CROSS_LINKS

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] Additive cross-links in HTOL guide, LangChain Phase 2 row, client-development-index, feedback-to-tied; optional harness-trace-review denominator hint.
- Contract:
  - INPUT: Committed charter path; REQ token id
  - PRE: No regression vs REQ-TIED_HARNESS_PLATFORM_SEAM authority checklist
  - OUTPUT: Updated markdown with resolvable relative links
  - POST: LangChain Phase 2 marked Implemented with doc/REQ links when implement complete

## SLICE_F_CHARTER_DOC_CONTRACT_TEST

- [IMPL-TIED_HARNESS_TRACE_LEARNING_PILOT] [ARCH-TIED_HARNESS_TRACE_LEARNING_PILOT] [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] RED then GREEN bootstrap test locking required charter sections and token refs.
- Contract:
  - INPUT: REQUIRED_MARKERS in harness-trace-learning-experiment-charter-doc.test.mjs
  - PRE: RED test committed and failing before charter body complete
  - OUTPUT: node --test pass | { error: missing_marker }
  - POST: Test references REQ-TIED_HARNESS_TRACE_LEARNING_PILOT in describe title
