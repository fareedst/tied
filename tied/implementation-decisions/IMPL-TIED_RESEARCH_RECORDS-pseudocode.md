# [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS]
# Defines structured external research records, freshness evaluation, and read-only dataset emission.

## Summary contract
INPUT: research record, source evidence, affected ARCH/IMPL alternatives, freshness policy, audited project boundary
PRE: record source/date/method/conclusion/uncertainty and provenance are present; audited project boundary is explicit
OUTPUT: normalized research record, freshness result, and external research-dataset entry
POST: record classification and proof boundary remain explicit; audited project source, tests, methodology, and project YAML are unchanged
FAILURE_MODES: InvalidRecord, MissingProvenance, InvalidDecisionLink, StaleEvidence, AuditedProjectWrite
DATA: append-only research dataset, evidence provenance, freshness policy, alternative links
DATA_TRANSITION: append a normalized record or freshness revision; never overwrite source evidence or canonical project intent
EFFECTS: IO, State
TERMINATION: total

## NORMALIZE_RESEARCH_RECORD
# [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Normalizes one typed research record without copying canonical decision bodies.
Contract:
  INPUT: raw record with type, source, source_date, method, conclusion, uncertainty, affected decisions, provenance, and classification
  PRE: record type is one of library_comparison, benchmark, security_finding, organizational_constraint, or experiment
  OUTPUT: normalized research record | error InvalidRecord | error MissingProvenance
  POST: required fields are present; ARCH/IMPL links are reference-only; candidate_finding, confirmed_case_report, and accepted_uncertainty remain distinct
  FAILURE_MODES: InvalidRecord, MissingProvenance, InvalidDecisionLink
  EFFECTS: pure
  TERMINATION: total
  validate record type and required fields
  normalize source identity, source_date, method, conclusion, and uncertainty
  validate evidence provenance contains revision, environment, command or method identity, result, and artifact references
  validate affected ARCH/IMPL alternatives as token links without loading copied bodies
  validate classification is candidate_finding, confirmed_case_report, or accepted_uncertainty
  RETURN normalized record

## EVALUATE_RESEARCH_FRESHNESS
# [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Applies an explicit freshness policy without presenting freshness as correctness proof.
Contract:
  INPUT: normalized research record, evaluation date, freshness policy
  PRE: source_date is parseable; policy declares max age or review interval and unknown-date behavior
  OUTPUT: current | stale | freshness_unknown with diagnostic
  POST: result identifies source date, evaluation date, policy, and proof boundary
  FAILURE_MODES: InvalidFreshnessPolicy
  EFFECTS: pure
  TERMINATION: total
  validate freshness policy
  IF source_date exceeds policy interval: RETURN stale with source and policy provenance
  IF source date or policy cannot establish age: RETURN freshness_unknown
  RETURN current

## EMIT_RESEARCH_DATASET_RECORD
# [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Emits external evidence while enforcing the read-only fidelity boundary.
Contract:
  INPUT: normalized record, freshness result, audited project boundary, research dataset
  PRE: dataset is outside audited project YAML; read-only profile is enabled
  OUTPUT: appended research-dataset record | error AuditedProjectWrite
  POST: external record retains provenance, freshness, decision links, classification, and proof boundary; audited project is unchanged
  FAILURE_MODES: AuditedProjectWrite, DatasetWriteFailure
  DATA: append-only research dataset
  DATA_TRANSITION: append one record; never mutate project REQ, ARCH, IMPL, tests, or code
  EFFECTS: IO, State
  TERMINATION: total
  resolve dataset path outside audited project YAML
  reject any target path under audited project tied/
  append normalized record and freshness result
  RETURN appended dataset record
