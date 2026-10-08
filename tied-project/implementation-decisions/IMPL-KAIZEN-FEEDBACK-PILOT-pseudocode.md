# [IMPL-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-ANALYSIS] [REQ-KAIZEN-OUTCOME-LOOP] [REQ-FEEDBACK_TO_TIED]
# Bounded Kaizen feedback pilot: named cohort, denominator-aware metrics, documented stop criteria; analysis evidence only until separate sponsor TIED change.

Grammar-Version: v2

## Summary contract
INPUT: PilotSpec { cohort_id, cohort selector, analysis_window, named_metrics[], stop_criteria_policy, transport_phase_status }, projectRoot
PRE: privacy tier operator_local on in-scope entries when tier present; no canonical REQ/ARCH/IMPL writes; pilot volume must not imply methodology promotion
OUTPUT: feedback-pilot.v1 report with metrics (numerator/denominator/unknown/excluded), stop_criteria evaluation, promotion_rule analysis_only
POST: feedback.yaml and project TIED YAML unchanged; report is appendable analysis evidence for export only
FAILURE_MODES: IncompatibleCohort, EmptyWindow, DenominatorMismatch, MissingEvidenceManifest, InvalidPilotSpec, StopCriteriaTriggered
EFFECTS: read-only IO on feedback store and digest projection; optional write of pilot report artifact path supplied by caller
TERMINATION: total

## RESOLVE_PILOT_COHORT
# [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Validate named pilot cohort against digest cohort selector and comparability bounds.
Contract:
  INPUT: PilotSpec.cohort { cohort_id, compatibility_key, denominator_fingerprint?, client_ids?, min_entries?, max_entries? }, analysis_window
  PRE: cohort_id is non-empty stable label; compatibility_key matches Phase 4 cohort selector shape
  OUTPUT: ResolvedPilotCohort | error InvalidPilotSpec | error IncompatibleCohort
  POST: client_ids when present restrict membership; min_entries defaults to 1 for comparability check
  FAILURE_MODES: InvalidPilotSpec, IncompatibleCohort
  EFFECTS: pure
  TERMINATION: total
  IF cohort_id blank OR compatibility_key blank: RETURN InvalidPilotSpec
  BUILD CohortSelector from pilot cohort fields
  LOAD feedback snapshot for analysis_window (read-only)
  COUNT entries matching compatibility_key and optional client_ids
  IF count < min_entries: RETURN IncompatibleCohort with reason insufficient_cohort_size
  IF max_entries set AND count > max_entries: RETURN IncompatibleCohort with reason cohort_not_comparable
  RETURN ResolvedPilotCohort with cohort_id, selector, entry_count

## BUILD_NAMED_PILOT_METRICS
# [IMPL-KAIZEN-FEEDBACK-PILOT] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-PILOT] — Compose named metrics with explicit denominators from digest and outcome facets.
Contract:
  INPUT: ResolvedPilotCohort, named_metrics[] from PilotSpec, buildFeedbackDigest result
  PRE: digest ok; each named metric id is in closed catalog for Phase 7
  OUTPUT: PilotMetricRow[] each with { metric_id, numerator, denominator, unknown, excluded, status }
  POST: absent values use unknown, not_measured, or not_applicable; no universal score
  FAILURE_MODES: DenominatorMismatch, EmptyWindow (propagate from digest)
  EFFECTS: pure
  TERMINATION: total
  CALL buildFeedbackDigest read-only with ResolvedPilotCohort selector
  IF digest error: RETURN propagated error
  FOR each metric_id in named_metrics:
    MAP metric_id to digest fields:
      observations_captured → inputs.entries / inputs.excluded / inputs.unknown
      recurrence_groups → observations.duplicate_groups length with denominator inputs.entries
      countermeasures_with_outcome → count outcome_observations on in-cohort entries vs countermeasures total not_measured at digest
      promotion_pending_rate → findings with promotion_status promotion_pending over in-cohort denominator
    EMIT PilotMetricRow with numerator, denominator, unknown, excluded, status measured|not_measured|not_applicable
  RETURN metrics array

## EVALUATE_STOP_CRITERIA
# [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Evaluate documented stop criteria; fail closed when triggered.
Contract:
  INPUT: PilotSpec.stop_criteria_policy, digest, metrics, transport_phase_status, pilot_incident_signals[]
  PRE: stop criteria list includes privacy_incident, notification_overload, transport_loss, classification_ambiguity_unresolved per program plan
  OUTPUT: StopCriteriaReport { criteria[], any_triggered, halted: boolean }
  POST: transport_loss and notification_overload marked not_applicable when transport_phase_status is deferred_closed
  FAILURE_MODES: StopCriteriaTriggered when any applicable criterion fires and policy requires halt
  EFFECTS: pure
  TERMINATION: total
  FOR each criterion in policy:
    privacy_incident: IF pilot_incident_signals contains privacy_incident THEN status triggered ELSE clear
    notification_overload: IF transport deferred THEN status not_applicable ELSE evaluate thresholds from policy
    transport_loss: IF transport deferred THEN status not_applicable ELSE evaluate delivery loss signals
    classification_ambiguity_unresolved: IF digest findings include unresolved observation_kind unknown above policy threshold THEN triggered
    denominator_incompatible: IF metrics contain DenominatorMismatch or incompatible cohort expansion THEN triggered
  SET any_triggered when any criterion status is triggered
  IF any_triggered AND policy.halt_on_trigger: RETURN StopCriteriaTriggered with StopCriteriaReport
  RETURN StopCriteriaReport with halted false

## BUILD_PILOT_REPORT
# [IMPL-KAIZEN-FEEDBACK-PILOT] [REQ-KAIZEN-FEEDBACK-PILOT] — Emit feedback-pilot.v1 analysis artifact with promotion rule and proof boundary.
Contract:
  INPUT: ResolvedPilotCohort, PilotMetricRow[], StopCriteriaReport, projection_hash from digest
  PRE: promotion_rule remains analysis_only; no methodology token mutation implied
  OUTPUT: FeedbackPilotReportV1 { schema_version, cohort_id, metrics, stop_criteria, promotion_rule, proof_boundary, digest_projection_hash }
  POST: report cites digest hash; pilot results are not authorization for canonical change
  FAILURE_MODES: none
  EFFECTS: pure unless caller requests persist path
  TERMINATION: total
  SET schema_version feedback-pilot.v1
  SET promotion_rule to analysis_evidence_until_separate_sponsor_tied_change
  SET proof_boundary pilot_volume_not_methodology_change
  ATTACH metrics and stop_criteria verbatim
  RETURN FeedbackPilotReportV1

## RUN_KAIZEN_FEEDBACK_PILOT
# [IMPL-KAIZEN-FEEDBACK-PILOT] [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-PILOT] — Orchestrate cohort resolve, metrics, stop criteria, and report without store mutation.
Contract:
  INPUT: PilotSpec, projectRoot, optional report_out_path
  PRE: canonicalWrite false; storeMutation false; transport_phase_status from program policy (Phase 3 deferred)
  OUTPUT: { ok, report?, error? }
  POST: feedback.yaml unchanged; requirements/architecture/implementation YAML unchanged
  FAILURE_MODES: InvalidPilotSpec, IncompatibleCohort, EmptyWindow, DenominatorMismatch, MissingEvidenceManifest, StopCriteriaTriggered
  EFFECTS: read-only on feedback store; optional IO write report JSON to report_out_path only
  TERMINATION: total
  RESOLVE cohort via RESOLVE_PILOT_COHORT
  BUILD metrics via BUILD_NAMED_PILOT_METRICS
  EVALUATE stop criteria via EVALUATE_STOP_CRITERIA
  BUILD report via BUILD_PILOT_REPORT
  IF report_out_path: WRITE report JSON atomically
  RETURN ok with report
