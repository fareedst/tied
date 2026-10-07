# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-FEEDBACK_STORAGE] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-KAIZEN-FEEDBACK-ANALYSIS] [REQ-FEEDBACK_TO_TIED] [REQ-KAIZEN-OBSERVATION-CAPTURE] [REQ-KAIZEN-SOURCE-NORMALIZATION] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]
# Read-only feedback digest projection: grouping, denominators, cohort compatibility, stable rerun identity.

Grammar-Version: v2

## Summary contract
INPUT: analysis request (window, cohort selector, optional manifest ref), read-only feedback entries and evidence refs
PRE: caller does not request canonical YAML mutation; entries loaded from feedback store without write handle
OUTPUT: feedback-analysis.v1 digest plus optional Markdown briefing; diagnostic exclusions when cohort incompatible
POST: source entries byte-identical after run; digest lists numerators, denominators, unknown, excluded, recurrence
FAILURE_MODES: IncompatibleCohort, EmptyWindow, DenominatorMismatch, MissingEvidenceManifest
EFFECTS: pure projection over in-memory snapshot (no store IO except read via existing load path)
TERMINATION: total

## LOAD_FEEDBACK_SNAPSHOT
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-FEEDBACK_STORAGE] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Read-only load of entries for analysis window.
Contract:
  INPUT: projectRoot, optional window { start, end }
  PRE: feedback.yaml readable or empty default
  OUTPUT: { entries[], loaded_at }
  POST: no append or update calls; snapshot is deep-frozen for analysis pass
  EFFECTS: read IO only
  TERMINATION: total
  CALL existing loadFeedbackEntries path
  FILTER entries by occurred_at within window when bounds provided
  RETURN frozen snapshot

## COMPUTE_COHORT_COMPATIBILITY
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Derive compatibility_key and denominator_fingerprint for selected cohort.
Contract:
  INPUT: snapshot entries[], cohort selector (client ids, schema profile)
  PRE: selector names intended comparison cohort
  OUTPUT: { compatibility_key, denominator_fingerprint, compatible_entries[], excluded[] }
  POST: entries with mismatched key or fingerprint land in excluded with reason incompatible_cohort
  FAILURE_MODES: IncompatibleCohort when no compatible entries remain
  EFFECTS: pure
  TERMINATION: total
  FOR each entry COMPUTE stable compatibility_key from schema version + privacy tier + profile fields
  FOR each entry COMPUTE denominator_fingerprint from declared denominator inputs or not_measured
  PARTITION into compatible vs excluded
  IF compatible empty AND window non-empty: RETURN EmptyWindow or IncompatibleCohort per fixture policy
  RETURN partition result

## GROUP_AND_RECURRENCE
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [IMPL-TIED_FEEDBACK_PROMOTION] [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION] — Deterministic duplicate groups and recurrence counts.
Contract:
  INPUT: compatible_entries[]
  PRE: duplicate_group stable from capture/normalization when present
  OUTPUT: { duplicate_groups[], recurrence[], by_kind counts }
  POST: grouping read-only; uses duplicate_group equality not fuzzy text match
  EFFECTS: pure
  TERMINATION: total
  BUILD map keyed by duplicate_group
  EMIT duplicate_groups with member ids and first_seen
  EMIT recurrence sorted by count desc with named numerators
  ACCUMULATE by observation_kind with unknown bucket for missing kind

## APPLY_DENOMINATOR_RULES
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Numerators and denominators with explicit mismatch handling.
Contract:
  INPUT: grouped stats, denominator_fingerprint, optional external denominator manifest
  PRE: never invent universal score; trends use named counts
  OUTPUT: impact { numerator, denominator, unknown, mismatch_reason? }
  POST: denominator mismatch surfaces mismatch_reason and excludes from rate comparison
  FAILURE_MODES: DenominatorMismatch
  EFFECTS: pure
  TERMINATION: total
  IF manifest fingerprint != cohort fingerprint: SET mismatch_reason denominator_mismatch
  IF denominator missing: USE not_measured for denominator field
  IF numerator missing: USE unknown
  RETURN impact block

## RESOLVE_PROMOTION_AND_LEAP_REFS
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Cite existing promotion_status and LEAP status without new stored fields.
Contract:
  INPUT: entry refs, optional proposal index read-only
  PRE: digest does not authorize methodology change
  OUTPUT: findings[] with promotion_status and leap_status per group
  POST: deferred_review appears only as digest review.decision label not entry mutation
  EFFECTS: read-only lookup
  TERMINATION: total
  FOR each observation_group CALL reportPromotionStatus when proposal link exists
  MAP leap proposal status to leap_status enum on countermeasures block
  NEVER write promotion_status back to entries

## BUILD_FEEDBACK_DIGEST
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [ARCH-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Assemble feedback-analysis.v1 with stable projection identity.
Contract:
  INPUT: analysis request, snapshot, cohort partition, groups, impact, findings
  PRE: schema_version feedback-analysis.v1
  OUTPUT: { digest, projection_hash }
  POST: identical inputs and ordering yield identical projection_hash (rerun identity fixture)
  EFFECTS: pure
  TERMINATION: total
  ASSEMBLE client_cohort, inputs manifest counts, observations, impact, findings, countermeasures, review placeholders
  COMPUTE projection_hash from canonical JSON stable sort
  RETURN digest and hash

## PROJECT_FEEDBACK_DIGEST_MARKDOWN
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — Human briefing derived from same digest object.
Contract:
  INPUT: digest object
  OUTPUT: markdown string
  POST: no additional facts beyond digest fields
  EFFECTS: pure
  TERMINATION: total
  RENDER sections for window, cohort, counts, recurrence, exclusions, findings
  RETURN markdown

## RUN_FEEDBACK_ANALYSIS
# [IMPL-KAIZEN_FEEDBACK_ANALYSIS] [REQ-KAIZEN-FEEDBACK-ANALYSIS] — End-to-end read-only analysis entry.
Contract:
  INPUT: BuildFeedbackDigestParams
  PRE: params forbid canonicalWrite and storeMutation
  OUTPUT: BuildFeedbackDigestResult
  POST: feedback store unchanged; digest ready for Phase 5 review bridge
  FAILURE_MODES: IncompatibleCohort, EmptyWindow, DenominatorMismatch, MissingEvidenceManifest
  EFFECTS: read-only IO via LOAD_FEEDBACK_SNAPSHOT only
  TERMINATION: total
  snapshot := LOAD_FEEDBACK_SNAPSHOT
  cohort := COMPUTE_COHORT_COMPATIBILITY
  groups := GROUP_AND_RECURRENCE(cohort.compatible_entries)
  impact := APPLY_DENOMINATOR_RULES(groups, cohort.denominator_fingerprint)
  findings := RESOLVE_PROMOTION_AND_LEAP_REFS(groups)
  digest := BUILD_FEEDBACK_DIGEST(...)
  RETURN { digest, projection_hash, markdown: PROJECT_FEEDBACK_DIGEST_MARKDOWN(digest) }
