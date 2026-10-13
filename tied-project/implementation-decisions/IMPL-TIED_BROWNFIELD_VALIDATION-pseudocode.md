# [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION] — Report-only matrix normalize and validate for brownfield intent elevation.

Grammar-Version: v2

## Normalize and validate intent elevation artifacts

- [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION] Parse Markdown tables and intent-elevation.v1 YAML into one normalized row model with stable hashes.
- Contract:
  - INPUT: markdown_text OR yaml_text; optional expected baseline_revision; mode (report_only default)
  - PRE: at least one artifact body present; schema_version intent-elevation.v1 when YAML
  - OUTPUT: validation report OR receipt with diagnostics, matrix_normalize_hash, blocking flag
  - POST:
    - success: ok true, no project YAML writes, receipt schema brownfield-intent-evidence-receipt.v1
    - error: ok false, diagnostics enumerate parse/enum/baseline/promotion violations
  - FAILURE_MODES: PARSE_ERROR, INVALID_YAML, INVALID_MARKDOWN, BASELINE_MISMATCH, ILLEGAL_PROMOTION_TARGET
  - EFFECTS: pure
  - TERMINATION: total

procedure NORMALIZE_INTENT_ELEVATION_ARTIFACT:
  # [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION] How: map Markdown columns to YAML keys and build NormalizedIntentElevation.
  Contract:
    INPUT: markdown_text | yaml_document
    OUTPUT: NormalizedIntentElevation | parse diagnostics
    PRE: artifact non-empty
    POST: equivalent Markdown/YAML inputs yield identical normalize hash
    EFFECTS: pure
  IF input is yaml_document THEN
    - PARSE YAML with schema_version intent-elevation.v1
    - MAP rows using row_id, claim, source_type, location, disposition, confidence, proof_boundary, promotion_target aliases
  ELSE
    - READ baseline_revision and scope_tokens from header lines
    - PARSE ## Matrix table rows into same row shape
  - COMPUTE matrix_normalize_hash from canonical JSON of rows and baseline
  - RETURN NormalizedIntentElevation

procedure VALIDATE_INTENT_ELEVATION_ROWS:
  # [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION] How: enforce disposition enums, required proof_boundary, and approved-only promotion targets.
  Contract:
    INPUT: NormalizedIntentElevation; optional expected baseline_revision
    OUTPUT: diagnostics list; ok boolean
    PRE: normalized.rows non-empty for valid matrices
    POST: promotion_target present only when disposition is approved
    EFFECTS: pure
  FOR each row IN normalized.rows
    - REQUIRE non-empty claim and proof_boundary
    - REQUIRE disposition in observed|approved|unresolved|rejected
    - IF promotion_target present AND disposition != approved THEN EMIT ILLEGAL_PROMOTION_TARGET
  IF expected baseline_revision != normalized.baseline_revision THEN EMIT BASELINE_MISMATCH
  - RETURN aggregated diagnostics

procedure BROWNFIELD_INTENT_EVIDENCE_VALIDATE:
  # [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION] How: MCP entry; compose normalize + validate; attach optional scoped analysis and claims review evidence ids; never call yaml_index or yaml_detail writers.
  Contract:
    INPUT: BrownfieldIntentEvidenceValidateInput
    OUTPUT: BrownfieldIntentEvidenceReceipt
    PRE: markdown_text or yaml_text supplied
    POST: success path leaves project TIED indexes unchanged; blocking true only when mode strict and ok false
    FAILURE_MODES: parse and validation codes from sub-procedures
    EFFECTS: IO when matrix_path read; no TIED YAML mutation
    DATA_TRANSITION: receipt.blocking and receipt.evidence_refs updated in memory only; project TIED indexes unchanged
  - CALL NORMALIZE_INTENT_ELEVATION_ARTIFACT
  - CALL VALIDATE_INTENT_ELEVATION_ROWS
  - SET blocking FROM mode strict AND NOT ok
  - ATTACH evidence_refs for scoped_analysis_evidence_id and claims_review_evidence_id when provided
  - RETURN receipt with validator_version and matrix_normalize_hash
