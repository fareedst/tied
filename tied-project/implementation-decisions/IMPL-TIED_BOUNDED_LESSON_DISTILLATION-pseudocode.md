# [IMPL-TIED_BOUNDED_LESSON_DISTILLATION] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
# Draft-only lesson distillation from divergence reports into feedback, vocabulary, and experiment drafts.

Grammar-Version: v2

## Lesson draft distillation

- [IMPL-TIED_BOUNDED_LESSON_DISTILLATION] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Pure distiller; explicit operator bridges required for any canonical write.
- Contract:
  - INPUT: divergence report descriptor, stale projection hash, eligibility context
  - PRE: report proof boundary includes advisory_not_gate_authority; report hash matches expected projection when supplied
  - OUTPUT: lesson draft bundle | error StaleReport | error IneligibleInput | error ExplicitWriteRequired
  - POST:
    - on success: emits methodology_improvement feedback draft, vocabulary RECORD candidate list, methodology-learning-experiment.v1 draft with hypothesis, baseline, privacy tier, proof boundary, source refs; default path does not call tied_feedback_add, vocabulary files, or experiment upsert
    - on error ExplicitWriteRequired: caller attempted silent canonical write
  - FAILURE_MODES: StaleReport, IneligibleInput, ExplicitWriteRequired, DuplicateSuppressed
  - EFFECTS: pure
  - TERMINATION: total

procedure DISTILL_TRAJECTORY_LESSONS(report, context):
  # [IMPL-TIED_BOUNDED_LESSON_DISTILLATION] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: map divergence evidence into reviewable drafts without silent mutation.
  Contract:
    INPUT: validated divergence report, distillation context
    OUTPUT: lesson draft bundle | error StaleReport | error IneligibleInput
    PRE: report eligible per proof boundaries and denominators when required
    POST: drafts reference evidence links; not_measured retained where denominators absent; conformance_only_trap boundary honored
    FAILURE_MODES: StaleReport, IneligibleInput, ExplicitWriteRequired, DuplicateSuppressed
    DATA_TRANSITION: none (pure distiller; no canonical writes)
    EFFECTS: pure
    TERMINATION: total
  IF report hash != context.expected_report_hash: RETURN error StaleReport
  IF report ineligible or missing required contrast rows: RETURN error IneligibleInput
  IF duplicate group already recorded for same stable identity: RETURN error DuplicateSuppressed
  build feedback draft, vocabulary candidates, experiment draft
  RETURN lesson draft bundle
