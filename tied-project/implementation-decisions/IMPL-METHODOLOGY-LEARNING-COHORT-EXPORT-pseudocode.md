# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]

Grammar-Version: v2

## Summary contract
INPUT: manifest path or object, base_path, yaml_out, optional now
PRE: manifest declares methodology-cohort-export-manifest.v1; profile paths are explicit
OUTPUT: methodology-learning-cohort-export.v1 YAML or stable diagnostics
POST: shareable_hashed output has hashed project identity and no absolute paths
FAILURE_MODES: invalid_manifest, missing_experiment, privacy_tier_not_exportable, privacy_policy_expired, w4_report_failure
EFFECTS: read W1 store and profile files; write declared yaml_out only
TERMINATION: total

## VALIDATE_COHORT_EXPORT_MANIFEST
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
Contract:
  INPUT: parsed manifest mapping
  OUTPUT: normalized rows or diagnostics
  PRE: schema_version matches MANIFEST_SCHEMA
  POST: reject duplicates, path escape, empty experiment list
  EFFECTS: none
  TERMINATION: total

## RESOLVE_W1_EXPERIMENTS
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-METHODOLOGY-LEARNING-EXPERIMENT] [REQ-METHODOLOGY-LEARNING-EXPERIMENT]
Contract:
  INPUT: experiment_ids, base_path
  OUTPUT: validated records keyed by id
  PRE: read-only store load
  POST: missing -> missing_experiment; invalid -> invalid_experiment_record
  EFFECTS: read store only
  TERMINATION: total

## EVALUATE_EXPORT_POLICY
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
Contract:
  INPUT: manifest policy block, resolved records, now
  OUTPUT: allow or blocking diagnostic
  PRE: redaction_owner, expiry, pilot present
  POST: operator_local records block with privacy_tier_not_exportable; expired policy blocks
  EFFECTS: none
  TERMINATION: total

## COMPOSE_W4_REPORT
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
Contract:
  INPUT: flattened profile paths, report mode/version, cwd
  OUTPUT: EvidenceChainStatisticsReport or w4_report_failure
  PRE: build evidence-chain-report-inputs.v1 without traversal
  POST: delegate to generateEvidenceChainStatisticsReport
  EFFECTS: read profile artifacts; write temp report files under cwd
  TERMINATION: total

## REDACT_SHAREABLE_HASHED
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [REQ-REQUEST_EVIDENCE_ENVELOPE]
Contract:
  INPUT: W4 report object
  OUTPUT: redacted report subtree
  PRE: privacy_tier shareable_hashed
  POST: hash project_id; basename-only artifact_ref; reject forbidden score keys
  EFFECTS: pure
  TERMINATION: total

## RUN_METHODOLOGY_LEARNING_COHORT_EXPORT
# [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
Contract:
  INPUT: RunCohortExportInput
  OUTPUT: ok + yaml path or diagnostics
  PRE: output path not forbidden
  POST: export includes policy metadata and proof boundary text
  EFFECTS: orchestrate validators and W4 adapter; write yaml_out
  TERMINATION: total
