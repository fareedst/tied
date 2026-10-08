# [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-REVIEW-BRIDGE] [REQ-KAIZEN-FEEDBACK-ANALYSIS] [REQ-FEEDBACK_TO_TIED]
# Record outcome observations against baselines within a follow-up window; validate evidence links; route regression to feedback analysis without reopening canonical requirements.

Grammar-Version: v2

## Summary contract
INPUT: operational feedback entry id, OutcomeObservationPayload, follow_up_window, projectRoot, optional observation_group anchor
PRE: entry exists with operational shape; privacy tier operator_local when tier present; no canonical REQ/ARCH/IMPL status mutation
OUTPUT: outcome-loop result with outcome value, persisted observation ref, optional regression_routing
POST: feedback.yaml receives append-only context.outcome_observations[]; project TIED YAML unchanged; requirements stay not reopened
FAILURE_MODES: MissingBaseline, MissingEntry, FollowUpWindowClosed, FollowUpWindowNotOpen, InvalidEvidenceLink, InvalidOutcome, StoreWriteFailed
EFFECTS: IO on feedback.yaml append path only; regression routing is a structured facet for analysis rerun
TERMINATION: total

## RESOLVE_BASELINE_FOR_ENTRY
# [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Resolve baseline from entry context.baseline_ref and/or explicit baseline snapshot in payload.
Contract:
  INPUT: operational entry context, payload.baseline { baseline_ref, snapshot_fingerprint?, captured_at? }
  PRE: at least one baseline source must be present for a measured outcome (not not_measured waiver path)
  OUTPUT: BaselineAnchor { baseline_ref, snapshot_fingerprint, captured_at } | error MissingBaseline
  POST: baseline_ref non-empty when outcome is improved|unchanged|regressed|inconclusive
  FAILURE_MODES: MissingBaseline
  EFFECTS: pure
  TERMINATION: total
  IF payload.baseline.baseline_ref present: USE payload baseline_ref as primary
  ELSE IF entry.context.baseline_ref present: USE entry.context.baseline_ref
  ELSE IF payload.outcome == not_measured AND explicit waiver flag: RETURN empty baseline anchor for not_measured only
  ELSE: RETURN MissingBaseline
  MERGE snapshot_fingerprint from payload or entry context baseline snapshot when present
  RETURN BaselineAnchor

## VALIDATE_FOLLOW_UP_WINDOW
# [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Ensure observed_at falls within the countermeasure follow-up window.
Contract:
  INPUT: follow_up_window { start, end }, observed_at ISO8601
  PRE: window bounds are ISO8601 or null open bound
  OUTPUT: ok | error FollowUpWindowNotOpen | error FollowUpWindowClosed
  POST: observations outside window are rejected; inconclusive may be recorded inside window only
  FAILURE_MODES: FollowUpWindowNotOpen, FollowUpWindowClosed
  EFFECTS: pure
  TERMINATION: total
  PARSE observed_at, window.start, window.end
  IF window.start set AND observed_at < window.start: RETURN FollowUpWindowNotOpen
  IF window.end set AND observed_at > window.end: RETURN FollowUpWindowClosed
  RETURN ok

## VALIDATE_EVIDENCE_LINK_INTEGRITY
# [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Validate evidence_links reference baseline and countermeasure anchors without orphan refs.
Contract:
  INPUT: evidence_links[], BaselineAnchor, optional countermeasure_ref, optional member entry evidence_links
  PRE: improved|unchanged|regressed|inconclusive require at least one evidence link unless outcome is inconclusive with explicit insufficient_evidence reason
  OUTPUT: ok | error InvalidEvidenceLink
  POST: every link is non-empty string; at least one link must resolve to baseline_ref prefix or known entry evidence id
  FAILURE_MODES: InvalidEvidenceLink
  EFFECTS: pure
  TERMINATION: total
  IF evidence_links empty AND outcome in {improved, unchanged, regressed}: RETURN InvalidEvidenceLink
  FOR each link in evidence_links:
    IF link is blank: RETURN InvalidEvidenceLink
  IF baseline_ref set AND no link matches baseline_ref or member entry evidence: RETURN InvalidEvidenceLink unless outcome == inconclusive
  RETURN ok

## CLASSIFY_OUTCOME_VALUE
# [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Normalize sponsor outcome to closed enum.
Contract:
  INPUT: payload.outcome, insufficient_evidence flag
  PRE: outcome is one of improved, unchanged, regressed, inconclusive, not_measured
  OUTPUT: OutcomeValue | error InvalidOutcome
  POST: inconclusive allowed when evidence insufficient but baseline present
  FAILURE_MODES: InvalidOutcome
  EFFECTS: pure
  TERMINATION: total
  IF outcome not in closed enum: RETURN InvalidOutcome
  IF insufficient_evidence AND outcome != inconclusive: SET outcome to inconclusive
  RETURN outcome

## ROUTE_REGRESSION_TO_ANALYSIS
# [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-OUTCOME-LOOP] — When outcome is regressed, emit analysis rerun facet without reopening canonical requirements.
Contract:
  INPUT: OutcomeValue, observation_group, entry id, baseline_ref
  PRE: regression routing is advisory to feedback analysis; no requirements.yaml status write
  OUTPUT: RegressionRouting { route: feedback_analysis, observation_group, entry_id, baseline_ref, recorded_at } | null
  POST: canonical requirement status unchanged; digest rerun is caller-driven via buildFeedbackDigest
  FAILURE_MODES: none (pure routing)
  EFFECTS: pure
  TERMINATION: total
  IF outcome != regressed: RETURN null
  BUILD RegressionRouting facet with reason regressed_outcome_observation
  RETURN RegressionRouting

## PERSIST_OUTCOME_OBSERVATION
# [IMPL-KAIZEN-OUTCOME-LOOP] [IMPL-MCP_FEEDBACK_TOOLS] [REQ-KAIZEN-OUTCOME-LOOP] — Append outcome-observation.v1 record to entry context atomically.
Contract:
  INPUT: entry id, OutcomeObservationRecord, projectRoot
  PRE: feedback.yaml load succeeds; entry id exists
  OUTPUT: { observation_id, persisted_at } | error StoreWriteFailed | error MissingEntry
  POST: append-only context.outcome_observations[]; original observation text unchanged
  FAILURE_MODES: MissingEntry, StoreWriteFailed
  DATA: feedback.yaml
  DATA_TRANSITION: append one outcome observation object per successful call
  EFFECTS: IO State
  TERMINATION: total
  LOAD feedback entries
  IF entry missing: RETURN MissingEntry
  APPEND record to entry.context.outcome_observations (initialize array if absent)
  WRITE feedback.yaml atomically
  RETURN observation_id

## BUILD_OUTCOME_LOOP_RESULT
# [IMPL-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Surface outcome, baseline anchor, and optional regression routing to caller.
Contract:
  INPUT: OutcomeValue, BaselineAnchor, observation_id, optional RegressionRouting
  PRE: result does not imply canonical apply or REQ reopen
  OUTPUT: { outcome, baseline_ref, observation_id, regression_routing?, proof_boundary }
  POST: proof_boundary states correction without baseline remains not_measured at digest layer
  EFFECTS: pure
  TERMINATION: total
  SET proof_boundary to outcome_observation_local_only
  RETURN structured result

## RUN_OUTCOME_LOOP
# [IMPL-KAIZEN-OUTCOME-LOOP] [ARCH-KAIZEN-OUTCOME-LOOP] [REQ-KAIZEN-OUTCOME-LOOP] — Primary entry: baseline, window, evidence, persist, regression routing.
Contract:
  INPUT: OutcomeObservationPayload, projectRoot, loaded operational entries map
  PRE: canonicalWrite false; storeMutation allowed only on feedback.yaml outcome facet
  OUTPUT: BUILD_OUTCOME_LOOP_RESULT | structured error
  POST: no automatic reopen of canonical requirements; no leap-proposals queue mutation
  FAILURE_MODES: MissingEntry, MissingBaseline, FollowUpWindowNotOpen, FollowUpWindowClosed, InvalidEvidenceLink, InvalidOutcome, StoreWriteFailed
  EFFECTS: read + conditional feedback.yaml write
  TERMINATION: total
  LOAD operational entry by id
  IF missing: RETURN MissingEntry
  CALL RESOLVE_BASELINE_FOR_ENTRY
  CALL VALIDATE_FOLLOW_UP_WINDOW
  CALL CLASSIFY_OUTCOME_VALUE
  CALL VALIDATE_EVIDENCE_LINK_INTEGRITY
  BUILD OutcomeObservationRecord with schema outcome-observation.v1
  CALL PERSIST_OUTCOME_OBSERVATION
  CALL ROUTE_REGRESSION_TO_ANALYSIS
  CALL BUILD_OUTCOME_LOOP_RESULT
  RETURN result
