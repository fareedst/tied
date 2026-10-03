# [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] — batch envelope gap report collector.


Grammar-Version: v2

# [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
# How: File-level contract INPUT where for constraint-enforced-v2; section bullet INPUT lines are assist-only.
Contract:
  INPUT: batch_manifest_path: string where length(batch_manifest_path) > 0
  OUTPUT: envelope-gap-report.v1.yaml | collection error
  PRE: manifest or corpus path resolves when provided
  POST: success emits gap report without score or ranking fields
  EFFECTS: IO
  TERMINATION: total

## COLLECT_ENVELOPE_GAP_REPORT

- [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Aggregate pre-generated or legacy-inferred envelopes across batch rows; emit envelope-gap-report.v1.yaml with per-kind denominators and no score field.
- Contract:
  - INPUT: batch manifest path, evaluation-corpus path, or inline rows; yaml_out path; privacy_tier default shareable_hashed
  - PRE: each row has project_root and request_token; require_envelope rows fail closed when envelope file missing
  - OUTPUT: { ok: true, report, yaml_path, report_hash } | { ok: false, error, validation_errors, exit_code }
  - POST:
    - success => schema_version envelope-gap-report.v1; rows sorted by client_alias + request_token; no maturity/score/ranking keys
    - legacy_infer without envelope => read-only BUILD_REQUEST_EVIDENCE_ENVELOPE with legacy_inferred gap tag
    - require_envelope without envelope => row status excluded with envelope_missing
  - FAILURE_MODES: InvalidManifest, InvalidCorpus, EmptyInput, ForbiddenScoreField
  - EFFECTS: IO read-only toward inner artifacts; writes report YAML only
  - TERMINATION: total
- PROCEDURE: COLLECT_ENVELOPE_GAP_REPORT
  - 1. LOAD_BATCH_ROWS from manifest, corpus extension, or inline rows
  - 2. FOR each row CALL RESOLVE_ENVELOPE_FOR_ROW
  - 3. IF envelope file exists THEN VALIDATE_REQUEST_EVIDENCE_ENVELOPE and COMPUTE_ARTIFACT_COVERAGE
  - 4. ELSE IF legacy_infer THEN BUILD_REQUEST_EVIDENCE_ENVELOPE read-only and tag legacy_inferred
  - 5. ELSE IF require_envelope THEN append excluded row with envelope_missing
  - 6. EMIT envelope-gap-report.v1.yaml with gap_codes[] and artifact_coverage.by_kind denominators
  - 7. Reject forbidden score or ranking fields before write
- How (sub-block, same token set): Shareable output strips absolute paths; comparable arm to evidence-chain-statistics-report without rollup score.

## LOAD_BATCH_ROWS

- [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Parse envelope-batch-inputs.v1 or evaluation-corpus.v1 extension rows.
- Contract:
  - INPUT: manifestPath | corpusPath | inline rows
  - OUTPUT: normalized BatchInputRow[]
  - POST: corpus rows require request_token; envelope_require_mode defaults legacy_infer for /dev/test/* until backfill pilot
  - EFFECTS: IO read-only
  - TERMINATION: total
- PROCEDURE: LOAD_BATCH_ROWS
  - 1. Validate schema_version
  - 2. Map corpus rows[] or projects[] with request_token to batch rows; skip profile-only rows; when project_root hosts REQ-REQUEST_EVIDENCE_ENVELOPE envelope file and corpus omits that row, append stdd dogfood batch row
  - 3. Default envelope_artifact to working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json

## COMPUTE_ARTIFACT_COVERAGE

- [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Count present/waived/not_applicable/missing per artifacts[].kind with explicit denominators.
- Contract:
  - INPUT: validated RequestEvidenceEnvelope
  - OUTPUT: by_kind map with KindCoverageCounts and denominator_kinds
  - POST: not_applicable_receipt increments waived; expected_missing increments missing; no score field
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: COMPUTE_ARTIFACT_COVERAGE
  - 1. Group artifacts[] by kind
  - 2. Map status present|stale_projection -> present; not_applicable -> not_applicable; expected_missing -> missing
  - 3. Count not_applicable_receipt as waived for phase slot
  - 4. Add expected_artifact_missing gaps to missing for artifact_kind
