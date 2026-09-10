# [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] — request-evidence-envelope.v1 builder, validator, and patch contract.

## BUILD_REQUEST_EVIDENCE_ENVELOPE

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Read-only scan of working/{REQ-TOKEN}/ to emit request-evidence-envelope.v1 with classified artifacts and explicit gaps[].
- Contract:
  - INPUT: build args including request_token, project_root, tied_base_path, optional depth_tier, gate_policy, output_mode
  - PRE: request_token matches REQ-[A-Z0-9_-]+; TIED base path confirmation attempted before scan
  - OUTPUT: { ok: true, envelope } | { ok: false, stage, error }
  - POST:
    - success => envelope.schema_version is request-evidence-envelope.v1 with deterministic sorted artifacts[] and gaps[]
    - error WrongTiedBasePath => no filesystem scan after fail-closed check
  - FAILURE_MODES: WrongTiedBasePath, InvalidRequestToken, WorkingFolderMissing, BuildScanFailed
  - DATA: working/{REQ-TOKEN}/ read-only; optional envelope file write when output_mode is file
  - DATA_TRANSITION: none on inner producer artifacts in Slice 1
  - EFFECTS: IO read-only; optional envelope file write
  - TERMINATION: total
- PROCEDURE: BUILD_REQUEST_EVIDENCE_ENVELOPE
  - 1. CALL RESOLVE_ENVELOPE_IDENTITY
  - 2. CALL DISCOVER_WORKING_ARTIFACTS
  - 3. CALL CLASSIFY_ARTIFACT_KINDS
  - 4. CALL COMPUTE_ARTIFACT_HASHES
  - 5. CALL DETECT_ENVELOPE_GAPS
  - 6. CALL BUILD_ENVELOPE_CROSS_LINKS
  - 7. CALL NORMALIZE_ENVELOPE_JSON
  - 8. IF output_mode is file THEN write only working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json
- ON scan failure: RETURN { ok: false, stage: "discover", error }
- ON WrongTiedBasePath: RETURN { ok: false, stage: "identity", error: "WrongTiedBasePath" }
- How (sub-block, same token set): Never mutate inner artifacts, project YAML, or methodology YAML during read-only build.

## VALIDATE_REQUEST_EVIDENCE_ENVELOPE

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Schema and contract validation for envelope JSON or path without mutating audited project YAML.
- Contract:
  - INPUT: envelope JSON object or envelope_path under project_root
  - PRE: envelope_path when provided must resolve inside project boundary
  - OUTPUT: { ok: true, envelope, diagnostics: [] } | { ok: false, diagnostics: string[] }
  - POST:
    - success => required fields present; artifacts[] entries have kind, path, content_hash, status; gaps[] entries have code and severity
    - failure => envelope_schema_invalid diagnostic with field-level detail
  - FAILURE_MODES: EnvelopeSchemaInvalid, EnvelopePathOutsideProject, EnvelopeReadFailed
  - EFFECTS: IO read-only
  - TERMINATION: total
- PROCEDURE: VALIDATE_REQUEST_EVIDENCE_ENVELOPE
  - 1. Load envelope from inline JSON or path
  - 2. Reject missing schema_version or identity.request_token
  - 3. Validate artifacts[] shape and allowed status values
  - 4. Validate gaps[] shape and known diagnostic codes
  - 5. Reject forbidden maturity or ranking fields if present
  - 6. WHEN fail_on_error_gaps is true AND any gap has severity error THEN RETURN ok false with envelope_blocking_gap diagnostics (Wave 1 W1-D3)
  - 7. RETURN validation result with blocking_gap_count and advisory_gap_count tallies
- How (sub-block, same token set): Close-out completion requires gate allowed AND envelope zero blocking error gaps unless a waiver registry entry covers each gap code.

## PATCH_REQUEST_EVIDENCE_ENVELOPE

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Append-only producer patch with monotonic revision and merge key (kind, phase, path); deferred hook activation until Slice 2.
- Contract:
  - INPUT: patch args including request_token, project_root, artifact entry, expected_revision optional
  - PRE: TIED_ENVELOPE_HOOKS=1 when invoked from producer paths; envelope file may not exist (bootstrap revision 1)
  - OUTPUT: { ok: true, envelope, revision } | { ok: false, gaps: [{ code: envelope_revision_conflict }] }
  - POST:
    - success => revision incremented; artifacts[] merged by (kind, phase, path); content_hash updated
    - conflict => envelope_revision_conflict gap emitted; no silent overwrite of disagreeing content_hash
  - FAILURE_MODES: EnvelopeRevisionConflict, EnvelopePatchFailed, PatchOutsideProject
  - DATA_TRANSITION: envelope file append-only update
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: PATCH_REQUEST_EVIDENCE_ENVELOPE
  - 1. Load existing envelope or seed revision 1 shell via BUILD_REQUEST_EVIDENCE_ENVELOPE
  - 2. Merge incoming artifact by (kind, phase, path)
  - 3. IF existing content_hash differs from incoming for same key THEN append envelope_revision_conflict gap and RETURN conflict
  - 4. Increment envelope_meta.revision monotonically
  - 5. Persist normalized envelope bytes
- How (sub-block, same token set): Producer hooks in hooks.ts call tryPatchRequestEvidenceEnvelope when TIED_ENVELOPE_HOOKS=1; inner artifact writes succeed even if patch fails (RISK-001 warn-only).

## PATCH_TRACKER_ENVELOPE_AGENTSTREAM

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] agentstream dual-write path patches checklist_tracker artifact after ApplyTrackerDisposition when TIED_ENVELOPE_HOOKS=1.
- Contract:
  - INPUT: project_root, request_token, tracker_path, tied_base_path
  - PRE: tracker disposition write succeeded; hooks flag enabled
  - OUTPUT: envelope revision incremented or diagnostic warn on failure
  - POST: checklist_tracker artifact merged with tracker content_hash; identical bytes when same payload invoked via Node patch CLI (RISK-002 dual-write parity)
  - FAILURE_MODES: envelope patch CLI missing, bootstrap build failure — non-fatal to tracker write
  - EFFECTS: subprocess node dist/cli/request-evidence-envelope-patch.js
  - TERMINATION: total
- PROCEDURE: PATCH_TRACKER_ENVELOPE_AGENTSTREAM
  - 1. Read tracker file and compute sha256 content_hash
  - 2. Invoke PATCH_REQUEST_EVIDENCE_ENVELOPE with kind checklist_tracker, phase null, proof_boundaries tracker_disposition_only
  - 3. On failure emit DIAGNOSTIC warn; do not roll back tracker write

## RESOLVE_TYPED_EVIDENCE_REFS

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Extend Go RESOLVE_EVIDENCE_REFS for typed evidence_refs maps at Tracker write time.
- Contract:
  - INPUT: evidence_refs[] entry as legacy string or typed map with kind + path
  - PRE: disposition completed
  - OUTPUT: resolved kind in {manifest_ref, gate_receipt, envelope_ref, file_path, command_evidence}
  - POST: generic prose rejected as unresolved_evidence_ref; gate_receipt requires checklist-gate-receipt.v1; envelope_ref requires request-evidence-envelope.v1
  - EFFECTS: read-only filesystem
  - TERMINATION: total
- PROCEDURE: RESOLVE_TYPED_EVIDENCE_REFS
  - 1. IF entry is map THEN require kind and path (except command_evidence object rules)
  - 2. Validate schema_version for gate_receipt and envelope_ref kinds
  - 3. RETURN resolved artifact hash for outcome_verified ledger append

## RESOLVE_ENVELOPE_IDENTITY

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Bind request_token, opaque project_id, depth_tier, gate_policy, methodology snapshot.
- Contract:
  - INPUT: request_token, project_root, tied_base_path, optional depth_tier, gate_policy
  - PRE: tied_base_path matches confirmed MCP base path
  - OUTPUT: identity block for envelope
  - POST: project_id from resolveProjectIdentity; never embed raw paths in shareable fields
  - FAILURE_MODES: WrongTiedBasePath, InvalidRequestToken
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: RESOLVE_ENVELOPE_IDENTITY
  - 1. Fail closed on WrongTiedBasePath
  - 2. Resolve project_id via shared project identity resolver
  - 3. Read depth_tier and gate_policy from CITDP or caller override
  - 4. Set methodology_snapshot_id from tied methodology version when available

## DISCOVER_WORKING_ARTIFACTS

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Walk working/{REQ-TOKEN}/ using checklist-activation and fixture-corpus discovery rules.
- Contract:
  - INPUT: request_token, project_root
  - OUTPUT: discovered file records with relative path and discovery source
  - POST: phase artifact directories preferred over root adversarial-inquiry projection
  - FAILURE_MODES: WorkingFolderMissing
  - EFFECTS: IO read-only
  - TERMINATION: total
- PROCEDURE: DISCOVER_WORKING_ARTIFACTS
  - 1. Resolve working/{REQ-TOKEN}/ root
  - 2. Collect adversarial-inquiry phase-{phase}/ quartet files
  - 3. Collect gates/, evidence/, tracker, CITDP cross-link targets
  - 4. Flag root-only adversarial-inquiry copies as stale_projection candidates

## CLASSIFY_ARTIFACT_KINDS

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Map discovered paths to artifacts[].kind enum including unknown with discovery_only proof boundary.
- Contract:
  - INPUT: discovered file records
  - OUTPUT: classified artifact draft entries
  - POST: every classified entry names schema_version when readable from JSON envelope
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: CLASSIFY_ARTIFACT_KINDS
  - 1. Match filename patterns to kind enum
  - 2. Assign phase from directory name or receipt metadata
  - 3. Mark unclassified files kind unknown with proof_boundaries discovery_only

## DETECT_ENVELOPE_GAPS

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Populate gaps[] from depth contract, corpus-manifest A1-A18 mappings, and discovery anomalies.
- Contract:
  - INPUT: classified artifacts, identity depth_tier, optional corpus inventory strings
  - OUTPUT: gaps[] with stable diagnostic codes
  - POST: reuse fidelity gate diagnostics where applicable; envelope-specific codes for missing envelope and revision conflict
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: DETECT_ENVELOPE_GAPS
  - 1. Map corpus inventory strings to envelope gap codes
  - 2. Emit provenance_incomplete when identity fields missing in evidence-provenance.json
  - 3. Emit artifact_path_root_projection_rejected for root-only inquiry copies
  - 4. Emit not_applicable_receipt_missing for minimal depth silent slots
  - 5. Sort gaps[] deterministically by code, phase, artifact_kind

## BACKFILL_REQUEST_EVIDENCE_ENVELOPE

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Legacy migration write path for timestamp client repos without producer hooks.
- Contract:
  - INPUT: backfill args including request_token, project_root, tied_base_path, optional depth_tier override, write_not_applicable_receipts default true
  - PRE: TIED base path confirmation; working/{REQ-TOKEN}/ exists
  - OUTPUT: { ok: true, envelope_path, not_applicable_receipt_path?, gaps_summary } | { ok: false, stage, error }
  - POST:
    - success => envelope written at working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json with envelope_meta.generator request_evidence_envelope_backfill
    - minimal depth => not-applicable-receipt.v1.json stub when inquiry slots absent and CITDP/checklist depth_tier is minimal
    - legacy citdp-closeout.json => legacy_json_in_json_wrapper gap; cross_links.citdp_path points to flat YAML
  - FAILURE_MODES: WrongTiedBasePath, WorkingFolderMissing, EnvelopeValidationFailed
  - DATA_TRANSITION: writes envelope and optional not-applicable receipt only; inner producer artifacts unchanged
  - EFFECTS: IO write envelope + optional receipt
  - TERMINATION: total
- PROCEDURE: BACKFILL_REQUEST_EVIDENCE_ENVELOPE
  - 1. CALL RESOLVE_DEPTH_TIER_FROM_CITDP (override wins)
  - 2. IF minimal AND write_not_applicable_receipts THEN CALL WRITE_NOT_APPLICABLE_RECEIPT_STUBS
  - 3. CALL BUILD_REQUEST_EVIDENCE_ENVELOPE with output_mode file
  - 4. Set envelope_meta.generator to request_evidence_envelope_backfill; prefer flat citdp_path in cross_links
  - 5. CALL VALIDATE_REQUEST_EVIDENCE_ENVELOPE on written path
  - 6. RETURN gaps_summary and gap_codes for operator batch registration
- How (sub-block, same token set): Read-only toward inner artifacts; backfill is the lawful bootstrap for pre-hook timestamp repos (Slice 5).

## NORMALIZE_ENVELOPE_JSON

- [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] Deterministic JSON bytes for same project tree inputs.
- Contract:
  - INPUT: envelope object
  - OUTPUT: normalized envelope object and stable serialized bytes
  - POST: sorted artifacts[] and gaps[]; stable ISO timestamps when fixed in tests via run clock injection
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: NORMALIZE_ENVELOPE_JSON
  - 1. Sort artifacts[] by kind, phase, path
  - 2. Sort gaps[] by code, phase, artifact_kind
  - 3. Serialize with stable key order and trailing newline
