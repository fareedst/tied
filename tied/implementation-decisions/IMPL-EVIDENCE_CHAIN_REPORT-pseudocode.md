# [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] — Read-only multi-client evidence-chain statistics report from profile artifacts.

## GENERATE_EVIDENCE_CHAIN_REPORT

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Compose manifest load, artifact validation, cohort partition, count-only aggregation, and deterministic YAML/Markdown emit without generating profiles or traversing client roots.
- Contract:
  - INPUT: report input manifest path, yaml_out path, markdown_out path, optional CLI mode override, optional clock
  - PRE: caller selected non-intent output paths; inputs name existing files or are recorded as missing
  - OUTPUT: { ok: true, report } | { ok: false, stage, error, excluded_inputs }
  - POST:
    - success => evidence-chain-statistics-report.v1 written with no maturity or score field and no client repo mutation
    - error in strict mode => no report files written
  - FAILURE_MODES: InvalidManifest, MissingArtifact, MalformedProfile, DuplicateInput, ForbiddenField, EmptyPartialCohort, ForbiddenOutputPath, OutputWriteFailure
  - DATA: explicit profile artifacts, caller-selected report directory
  - DATA_TRANSITION: create or overwrite only yaml_out and markdown_out
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: GENERATE_EVIDENCE_CHAIN_REPORT
  - 1. Resolve and validate non-intent output paths; remove stale generated files before a new attempt.
  - 2. CALL LOAD_REPORT_INPUT_MANIFEST
  - 3. FOR each input in stable sort order CALL VALIDATE_PROFILE_ARTIFACT then CALL RESOLVE_INPUT_IDENTITY
  - 4. IF mode is strict AND any input is rejected THEN RETURN error without outputs
  - 5. IF mode is partial AND accepted set is empty THEN RETURN EmptyPartialCohort
  - 6. CALL PARTITION_CLIENT_COHORTS
  - 7. CALL AGGREGATE_COHORT_STATISTICS
  - 8. CALL RENDER_STATISTICS_REPORT_YAML
  - 9. CALL RENDER_STATISTICS_REPORT_MARKDOWN including validation_errors
- ON output write failure: remove any partial/stale report files and RETURN OutputWriteFailure.
- How (sub-block, same token set as above): Never call GENERATE_EVIDENCE_CHAIN_PROFILE, RUN_FIRST_SLICE, appendCandidateFinding, promoteConfirmedCase, or walk a client project_root.

## LOAD_REPORT_INPUT_MANIFEST

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Parse evidence-chain-report-inputs.v1 and resolve mode plus path-privacy flags.
- Contract:
  - INPUT: manifest file path, optional CLI mode override
  - PRE: path is a readable file
  - OUTPUT: { schema_version, mode, include_absolute_paths, inputs[] } | error InvalidManifest
  - POST:
    - success => schema_version is evidence-chain-report-inputs.v1; CLI mode overrides manifest mode when provided
    - error InvalidManifest => generation stops
  - FAILURE_MODES: InvalidManifest
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: LOAD_REPORT_INPUT_MANIFEST
  - 1. Reject unknown schema_version or missing inputs array
  - 2. Default mode to strict; default include_absolute_paths to false
  - 3. Require each input.profile_path; allow optional client_alias and notes

## VALIDATE_PROFILE_ARTIFACT

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Read one JSON artifact and apply evidence-chain-profile.v1 identity, derived-field, and forbidden-field rules without mutating the file.
- Contract:
  - INPUT: profile_path
  - PRE: path is supplied
  - OUTPUT: normalized profile | error MissingArtifact | MalformedProfile | ForbiddenField
  - POST:
    - success => identity.schema_version is evidence-chain-profile.v1; every derived field has source, method, denominator, and proof_boundary
    - error => artifact is excluded or fails the batch per mode
  - FAILURE_MODES: MissingArtifact, MalformedProfile, ForbiddenField
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: VALIDATE_PROFILE_ARTIFACT
  - 1. IF file is absent THEN RETURN MissingArtifact
  - 2. Reject keys maturity, score, maturity_score, and universal_score anywhere in the object
  - 3. Require identity.project_id, identity.commit, scope.profile_depth, and derived-field contract
  - 4. Preserve observed, not_measured, unknown, and not_applicable; never coerce missing evidence to zero
  - 5. Reuse profile normalizer rules; do not call the generator

## RESOLVE_INPUT_IDENTITY

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Bind hashed project_id as stable identity, optional client_alias as display name, and a duplicate key.
- Contract:
  - INPUT: validated profile, input row, include_absolute_paths
  - PRE: profile identity fields are present
  - OUTPUT: accepted input record or DuplicateInput
  - POST:
    - success => duplicate_key is (project_id, commit, profile_depth, scope_hash); artifact_ref is basename unless include_absolute_paths is true
    - error DuplicateInput => later duplicate of the same key
  - FAILURE_MODES: DuplicateInput
  - DATA: scope_hash from operational.scope_hash or a hash of the canonical scope object
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: RESOLVE_INPUT_IDENTITY
  - 1. Compute profile_hash of the artifact bytes
  - 2. Compute scope_hash if absent
  - 3. IF duplicate_key already accepted THEN reject the later input
  - 4. Keep client_alias off the identity key

## PARTITION_CLIENT_COHORTS

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Separate incompatible schema_version and profile_depth groups; never merge them.
- Contract:
  - INPUT: accepted input records
  - PRE: every record has schema_version and profile_depth
  - OUTPUT: client cohorts keyed by compatibility_key
  - POST: success => compatibility_key is schema_version + "|" + profile_depth; no cross-cohort statistic exists
  - FAILURE_MODES: none
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: PARTITION_CLIENT_COHORTS
  - 1. Group by compatibility_key
  - 2. Stable-sort cohorts and members by project_id, commit, profile_depth, artifact_ref
  - 3. Do not treat denominator numeric values as a split key; v1 does not sum those values
  - 4. Record an explicit residual risk whenever profiles in one cohort use different denominators for the same field path

## AGGREGATE_COHORT_STATISTICS

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Emit only named count statistics with visible numerator, denominator, status, source, method, and proof_boundary.
- Contract:
  - INPUT: one client cohort
  - PRE: all members share compatibility_key
  - OUTPUT: named statistics plus per-client rows
  - POST:
    - success => v1 catalog only; no average of ratios; missing statuses remain not_measured, unknown, or not_applicable
    - never emit maturity or universal score
  - FAILURE_MODES: none
  - DATA: cohort_profile_count, unique_project_id_count, measurement_status_count, proof_boundary_partition_count
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: AGGREGATE_COHORT_STATISTICS
  - 1. Count accepted profiles and unique project_id values
  - 2. Count measurement statuses per required derived-field path
  - 3. Count proof_boundary partition memberships
  - 4. Copy residual-risk text from profiles when present without scoring it
  - 5. How (sub-block, same token set as above): Do not sum or average derived-field value numbers in v1

## RENDER_STATISTICS_REPORT_YAML

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Write the authoritative evidence-chain-statistics-report.v1 document with stable key order.
- Contract:
  - INPUT: aggregated report object, yaml_out, generated_at from injected clock
  - PRE: output path is a non-intent file
  - OUTPUT: byte-stable YAML
  - POST: success => schema_version evidence-chain-statistics-report.v1; Markdown is not the authority
  - FAILURE_MODES: ForbiddenOutputPath
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: RENDER_STATISTICS_REPORT_YAML
  - 1. Reject output paths under tied/requirements, tied/architecture-decisions, tied/implementation-decisions, or tied/methodology
  - 2. Include report identity, inputs, cohorts, excluded_inputs, validation_errors, residual_risks, and generator_version
  - 3. Sort all arrays and comparison keys

## RENDER_STATISTICS_REPORT_MARKDOWN

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Project the same YAML values into a deterministic Markdown document.
- Contract:
  - INPUT: the YAML report object, markdown_out
  - PRE: YAML object is already validated
  - OUTPUT: Markdown whose numeric and status values equal the YAML
  - POST: success => no extra statistics beyond YAML
  - FAILURE_MODES: ForbiddenOutputPath
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: RENDER_STATISTICS_REPORT_MARKDOWN
  - 1. Render generated_at, mode, input count, cohort count
  - 2. Render each cohort compatibility_key and named statistics
  - 3. Render excluded inputs, validation errors, residual-risk notes, and provenance hashes

## RUN_EVIDENCE_CHAIN_REPORT_CLI

- [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT] Parse argv and exit nonzero in strict mode when any input is rejected.
- Contract:
  - INPUT: --inputs, --yaml-out, --markdown-out, optional --mode
  - PRE: required flags are present
  - OUTPUT: process exit 0 on success; exit 2 on strict rejection; exit 1 on EmptyPartialCohort or usage error
  - POST: success => files exist; failure in strict => files absent
  - FAILURE_MODES: InvalidManifest, MissingArtifact, MalformedProfile, DuplicateInput, ForbiddenField, EmptyPartialCohort, ForbiddenOutputPath
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: RUN_EVIDENCE_CHAIN_REPORT_CLI
  - 1. Parse flags; default --mode to strict
  - 2. CALL GENERATE_EVIDENCE_CHAIN_REPORT
  - 3. Map errors to exit codes without printing absolute client paths unless include_absolute_paths is true
