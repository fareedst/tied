# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# Summary: Validate Tracker, CITDP, and identity-bound adversarial evidence before workflow progression.

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate disposition contracts and reject generic skips.
procedure VALIDATE_TRACKER(tracker, phase):
  Contract:
  INPUT: tracker, phase
  PRE: tracker is a map and phase is pre_implementation, verification, or close_out
  OUTPUT: validation result with diagnostics
  POST: pending required steps fail; completed steps have evidence; not_applicable has policy and rationale; waived has owner, expiry, approval, and residual risk
  FAILURE_MODES: malformed_tracker, pending_required_step, invalid_disposition, missing_disposition_evidence, expired_waiver
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate adversarial section shape for CITDP persistence without progression pairing.
procedure VALIDATE_CITDP_OPEN_RECORD(citdp, existing_depth_tier, activation):
  Contract:
  INPUT: citdp, existing_depth_tier, optional activation
  PRE: citdp is a map when adversarial fields are present
  OUTPUT: validation result with diagnostics
  POST: minimal depth has counterexamples, falsification questions, disconfirming observations, and evidence references; strict_candidate open records require the same manual fields; integrated depth may omit activation pre-inquiry; supplied activation must pair receipt with artifacts; minimal-to-integrated upgrade requires prior_depth_tier minimal; prior_depth_tier is preserved on overwrite when incoming omits it
  FAILURE_MODES: malformed_citdp, missing_depth, missing_minimal_evidence, partial_activation, malformed_activation, depth_upgrade_requires_prior_depth_tier, depth_downgrade_requires_waiver
  EFFECTS: pure
  TERMINATION: total
  IF adversarial section missing: RETURN malformed_citdp
  IF depth is minimal or strict_candidate: require minimal manual evidence fields
  IF depth is integrated AND existing_depth_tier is minimal AND prior_depth_tier is not minimal: RETURN depth_upgrade_requires_prior_depth_tier
  IF activation supplied: reject partial receipt or artifacts; VALIDATE_ACTIVATION_PAIRING when both present
  IF depth downgrade from integrated or strict_candidate to minimal without waiver: RETURN depth_downgrade_requires_waiver
  RETURN success

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: enforce depth-specific adversarial obligations before progression.
procedure VALIDATE_ADVERSARIAL_CONTRACT(citdp, phase):
  Contract:
  INPUT: citdp, phase
  PRE: citdp is a map and phase is an allowed gate phase
  OUTPUT: validation result with diagnostics
  POST: minimal depth has counterexamples, falsification questions, disconfirming observations, and evidence references; integrated depth has valid activation pairing when supplied
  FAILURE_MODES: malformed_citdp, missing_depth, missing_minimal_evidence, invalid_activation, stale_identity
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: pair the successful inquiry receipt with all four identity-bound artifacts.
procedure VALIDATE_ACTIVATION_PAIRING(receipt, artifacts, expected):
  Contract:
  INPUT: receipt, artifacts, expected
  PRE: expected contains request_token, project_id, run_id, phase, scope, and scope_hash
  OUTPUT: validation result with diagnostics and artifact hashes
  POST: receipt and every required artifact match the expected identity; receipt hashes equal artifact hashes; expected scope_hash equals the stable scope hash; when artifact path is present it must lie under working/{REQ-TOKEN}/adversarial-inquiry/phase-{expected.phase}/ and must not use root projection paths
  FAILURE_MODES: missing_receipt, unsuccessful_receipt, missing_expected_identity, missing_activation_artifact, invalid_activation_artifact, artifact_hash_mismatch, artifact_path_wrong_phase, artifact_path_root_projection_rejected, stale_identity
  DATA: receipt, artifacts, expected, artifact_hashes
  EFFECTS: pure
  TERMINATION: total
  IF receipt is missing or receipt.success is not true: RETURN failure missing_or_unsuccessful_inquiry_receipt
  IF receipt.tool is not tied_adversarial_inquiry_run: RETURN failure invalid_inquiry_tool
  FOR each required artifact name in obligation-report.json, finding-ledger.jsonl, gate-result.json, evidence-provenance.json:
    IF artifact is missing or artifact.valid is not true or artifact.hash is empty: RETURN failure
    IF artifact identity differs from expected: RETURN stale_identity
    IF artifact.path is present AND path is not under working/{REQ-TOKEN}/adversarial-inquiry/phase-{expected.phase}/: RETURN artifact_path_wrong_phase or artifact_path_root_projection_rejected
  IF receipt identity or scope hash differs from expected: RETURN stale_identity
  IF receipt artifact hashes differ from artifact hashes: RETURN artifact_hash_mismatch
  RETURN successful pairing with artifact_hashes

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive auto-required Tracker slugs from depth and gate phase; caller slugs union only.
procedure DERIVE_PHASE_AWARE_SLUGS(depth, phase):
  Contract:
  INPUT: depth, phase
  PRE: depth is minimal, integrated, or strict_candidate and phase is an allowed gate phase
  OUTPUT: ordered slug list
  POST: integrated depth returns INTEGRATED_REQUIRED_SLUGS for the phase; strict_candidate returns the same set only at verification and close_out; minimal returns sub-adversarial-inquiry-pass for every phase; strict_candidate at pre_implementation returns empty aside from minimal sub-stub union handled by depth branch
  FAILURE_MODES: invalid_phase
  EFFECTS: pure
  TERMINATION: total
  IF depth is integrated: RETURN INTEGRATED_REQUIRED_SLUGS[phase]
  IF depth is strict_candidate AND phase is verification or close_out: RETURN INTEGRATED_REQUIRED_SLUGS[phase]
  RETURN empty slug list

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: emit warn-only minimal_depth_missing_waiver when §7 eligibility triggers match, depth_tier is minimal, and integrated_waiver is incomplete.
procedure VALIDATE_MINIMAL_WAIVER(citdp):
  Contract:
  INPUT: citdp
  PRE: citdp may include risk_analysis.adversarial_inquiry and eligibility_triggers_matched recorded at risk-assessment
  OUTPUT: validation result with diagnostics
  POST: when eligibility_triggers_matched is non-empty, depth_tier is minimal, and integrated_waiver lacks owner, expiry, rationale, and approval, append minimal_depth_missing_waiver; when triggers empty, waiver complete, or depth is integrated or strict_candidate, no diagnostic; diagnostic is warn-only and does not fail allowed under gate_policy advisory
  FAILURE_MODES: minimal_depth_missing_waiver
  EFFECTS: pure
  TERMINATION: total
  IF depth_tier is not minimal: RETURN success
  IF eligibility_triggers_matched is empty: RETURN success
  IF integrated_waiver has owner, expiry, rationale, and approval: RETURN success
  RETURN advisory diagnostic minimal_depth_missing_waiver

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject silent downgrade from integrated or strict_candidate to minimal without waiver.
procedure VALIDATE_DEPTH_DOWNGRADE(citdp, prior_depth_tier):
  Contract:
  INPUT: citdp, prior_depth_tier
  PRE: citdp adversarial section exposes depth_tier
  OUTPUT: validation result with diagnostics
  POST: when prior_depth_tier is integrated or strict_candidate and current depth_tier is minimal, integrated_waiver or depth_change_waiver with owner, expiry, rationale, and approval must be present; missing prior_depth_tier skips downgrade check
  FAILURE_MODES: depth_downgrade_requires_waiver
  EFFECTS: pure
  TERMINATION: total
  IF prior_depth_tier is missing or null: RETURN success
  IF prior_depth_tier is not integrated or strict_candidate: RETURN success
  IF current depth_tier is not minimal: RETURN success
  IF integrated_waiver or depth_change_waiver has owner, expiry, rationale, and approval: RETURN success
  RETURN failure depth_downgrade_requires_waiver

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: require completion_criteria.activation on gate read at late integrated phases.
procedure VALIDATE_COMPLETION_ACTIVATION(citdp, phase, depth):
  Contract:
  INPUT: citdp, phase, depth
  PRE: phase and depth are selected
  OUTPUT: validation result with diagnostics
  POST: at verification and close_out when depth is integrated, or strict_candidate at those phases, completion_criteria.activation must include a non-empty run_id; close_out citation is not reusable as activation input
  FAILURE_MODES: missing_completion_activation
  EFFECTS: pure
  TERMINATION: total
  IF phase is not verification or close_out: RETURN success
  IF depth is not integrated AND NOT (depth is strict_candidate AND phase is verification or close_out): RETURN success
  IF completion_criteria.activation.run_id is non-empty: RETURN success
  RETURN failure missing_completion_activation

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: bind each inquiry receipt to exactly one gate phase.
procedure VALIDATE_RECEIPT_PHASE(receipt, gate_phase):
  Contract:
  INPUT: receipt, gate_phase
  PRE: gate_phase is an allowed gate phase
  OUTPUT: validation result with diagnostics
  POST: when receipt is present, receipt.phase equals gate_phase; verification receipt cannot satisfy close_out activation
  FAILURE_MODES: receipt_identity_mismatch:phase
  EFFECTS: pure
  TERMINATION: total
  IF receipt is missing: RETURN success
  IF receipt.phase equals gate_phase: RETURN success
  RETURN failure receipt_identity_mismatch:phase

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject placeholder waiver values so close_out cannot bypass pairing with tilde or empty fields.
procedure VALIDATE_WAIVER_FIELD(value):
  Contract:
  INPUT: value
  PRE: value is a waiver field candidate
  OUTPUT: boolean present
  POST: null, empty string, and tilde are absent; non-empty non-placeholder strings are present
  FAILURE_MODES: placeholder_waiver
  EFFECTS: pure
  TERMINATION: total
  IF value is null or undefined or empty string or tilde: RETURN absent
  RETURN present

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: depth-change and close-out inquiry waivers require real owner, expiry, rationale, approval, and referenced run_id fields.
procedure HAS_VALID_CLOSE_OUT_INQUIRY_WAIVER(section):
  Contract:
  INPUT: section adversarial_inquiry map
  PRE: section may include close_out_inquiry_waiver
  OUTPUT: boolean valid
  POST: every waiver field passes VALIDATE_WAIVER_FIELD; referenced_verification_run_id is present; placeholder tilde owner never satisfies the waiver
  FAILURE_MODES: placeholder_waiver, incomplete_waiver
  EFFECTS: pure
  TERMINATION: total
  IF close_out_inquiry_waiver is missing or any required field is placeholder or absent: RETURN false
  RETURN true

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive activation.expected from a complete receipt when the caller omits expected; never infer missing receipt fields.
procedure DERIVE_EXPECTED_FROM_RECEIPT(receipt):
  Contract:
  INPUT: receipt
  PRE: receipt is a map from tied_adversarial_inquiry_run
  OUTPUT: expected identity or absent
  POST: when request_token, project_id, run_id, phase, scope, and scope_hash are all present and scope_hash matches the stable scope hash, expected is returned; missing receipt fields are not inferred
  FAILURE_MODES: missing_expected_identity
  DATA: expected, scope_hash
  EFFECTS: pure
  TERMINATION: total
  IF receipt is missing any required identity field: RETURN absent
  IF receipt scope hash differs from stable hash of receipt scope: RETURN absent
  RETURN expected identity projection

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: at minimal depth require sub-adversarial-inquiry-pass to be not_applicable or waived; pending fails at every gate phase.
procedure VALIDATE_MINIMAL_SUB_STUB_DISPOSITION(tracker, required_slugs, depth):
  Contract:
  INPUT: tracker, required_slugs, depth
  PRE: depth is minimal and required_slugs includes sub-adversarial-inquiry-pass
  OUTPUT: validation result with diagnostics
  POST: pending sub-stub fails with pending_required_step; not_applicable or waived with rationale satisfies the contract
  FAILURE_MODES: pending_required_step:sub-adversarial-inquiry-pass
  EFFECTS: pure
  TERMINATION: total
  IF depth is not minimal: RETURN success
  IF sub-adversarial-inquiry-pass disposition is pending: RETURN failure pending_required_step

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: at integrated depth a completed parent slug cannot coexist with a pending sub-adversarial-inquiry-pass.
procedure VALIDATE_INTEGRATED_PARENT_CHILD_SLUGS(tracker, depth, phase):
  Contract:
  INPUT: tracker, depth, phase
  PRE: depth is integrated or strict_candidate
  OUTPUT: validation result with diagnostics
  POST: when any auto-required parent slug is completed and sub-adversarial-inquiry-pass is pending, validation fails
  FAILURE_MODES: sub_stub_pending_while_parent_completed
  EFFECTS: pure
  TERMINATION: total
  IF sub-adversarial-inquiry-pass is pending AND any other auto-required slug for the phase is completed: RETURN failure
  RETURN success

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject sparse Tracker missing phase-aware slug dispositions (remediation A1).
procedure VALIDATE_TRACKER_SPARSE(tracker, required_slugs, depth):
  Contract:
  INPUT: tracker, required_slugs, depth
  PRE: depth is integrated or strict_candidate
  OUTPUT: validation result with diagnostics
  POST: execution_evidence.completed without matching step dispositions fails with tracker_sparse; two or more missing auto slugs fail with tracker_sparse
  FAILURE_MODES: tracker_sparse, missing_required_step
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject synthetic Tracker projections substituted for authoritative file (remediation A2).
procedure VALIDATE_TRACKER_AUTHORITATIVE(tracker, tracker_source):
  Contract:
  INPUT: tracker, tracker_source
  PRE: tracker may include synthetic projection marker
  OUTPUT: validation result with diagnostics
  POST: tracker_source synthetic_projection or _synthetic_projection marker fails with tracker_not_authoritative
  FAILURE_MODES: tracker_not_authoritative
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: require complete evidence provenance identity and command retention (remediation A3/A6).
procedure VALIDATE_PROVENANCE_COMPLETE(provenance):
  Contract:
  INPUT: provenance document
  PRE: provenance may nest under provenance key
  OUTPUT: validation result with diagnostics
  POST: missing request_token, phase, run_id, command, tool_version, or schema version fails with provenance_incomplete
  FAILURE_MODES: provenance_incomplete
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: unresolved or warn findings cannot satisfy gate success (remediation A5).
procedure VALIDATE_FINDING_DISPOSITION(gate_result, finding_ledger):
  Contract:
  INPUT: gate_result, finding_ledger
  PRE: gate_result may include verdict UNRESOLVED or status warn
  OUTPUT: validation result with diagnostics
  POST: UNRESOLVED verdict or observed lifecycle in ledger fails with finding_unresolved; warn status fails with warn_not_success
  FAILURE_MODES: finding_unresolved, warn_not_success
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject self-reported command success without retained output/manifest (remediation A6).
procedure VALIDATE_COMMAND_EVIDENCE(evidence):
  Contract:
  INPUT: evidence map with claimed_success flag
  PRE: evidence may claim success without artifacts
  OUTPUT: validation result with diagnostics
  POST: claimed_success without manifest_ref, output path, and exit_code fails with command_success_unproven
  FAILURE_MODES: command_success_unproven
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject stale or hash-mismatched activation evidence (remediation A7).
procedure VALIDATE_EVIDENCE_FRESHNESS(declared_hashes, computed_hashes, cross_phase_reuse):
  Contract:
  INPUT: declared_hashes, computed_hashes, cross_phase_reuse flag
  PRE: hashes may be supplied by collector or gate caller
  OUTPUT: validation result with diagnostics
  POST: hash mismatch or cross_phase_reuse fails with evidence_stale and artifact_hash_mismatch codes
  FAILURE_MODES: evidence_stale, artifact_hash_mismatch
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject dirty or untracked post-gate tree at close_out (remediation A15).
procedure VALIDATE_CLOSE_OUT_TREE(dirty_paths, untracked_paths):
  Contract:
  INPUT: dirty_paths, untracked_paths
  PRE: close_out phase selected
  OUTPUT: validation result with diagnostics
  POST: any dirty or untracked path fails with tree_dirty_post_gate
  FAILURE_MODES: tree_dirty_post_gate
  EFFECTS: pure
  TERMINATION: total

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: emit stable remediation diagnostics alongside granular codes.
procedure NORMALIZE_REMEDIATION_DIAGNOSTICS(diagnostics):
  Contract:
  INPUT: granular diagnostic codes
  PRE: diagnostics is a list
  OUTPUT: expanded diagnostic list
  POST: adds tracker_sparse, activation_pairing_incomplete, sub_stub_pending, parent_child_inconsistent, evidence_stale, tracker_not_authoritative, waiver_invalid aliases when matching granular codes present
  FAILURE_MODES: none
  EFFECTS: pure
  TERMINATION: total

## VALIDATE_CHECKLIST_GATE
# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: select depth before evaluating phase gates and fail closed on invalid evidence.

procedure VALIDATE_CHECKLIST_GATE(input): # [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
  INPUT: tracker, citdp, activation, phase, required_step_slugs, prior_depth_tier, evidence
  PRE: phase is selected before this procedure is called
  OUTPUT: { allowed, diagnostics, depth, blocking }
  POST: allowed is true only when every required contract passes; auto slugs union with caller slugs; integrated or late strict_candidate pairing is mandatory unless close_out inquiry waiver applies; optional evidence payload validates provenance, findings, command output, freshness, and tree; advisory policy may warn only after required evidence is valid
  FAILURE_MODES: malformed_input, tracker_failure, citdp_failure, activation_failure, integrated_depth_requires_pairing, activation_pairing_incomplete, depth_downgrade_requires_waiver, missing_completion_activation, receipt_identity_mismatch:phase, tracker_sparse, tracker_not_authoritative, provenance_incomplete, finding_unresolved, command_success_unproven, evidence_stale, tree_dirty_post_gate, waiver_invalid
  DATA_TRANSITION: diagnostics accumulates contract results; allowed derives from empty blocking diagnostics
  EFFECTS: pure
  TERMINATION: total
  depth := adversarial depth_tier from citdp
  autoSlugs := DERIVE_PHASE_AWARE_SLUGS(depth, input.phase)
  requiredSlugs := union(autoSlugs, input.required_step_slugs)
  downgradeResult := VALIDATE_DEPTH_DOWNGRADE(citdp, input.prior_depth_tier ?? citdp prior_depth_tier)
  completionResult := VALIDATE_COMPLETION_ACTIVATION(citdp, input.phase, depth)
  receiptPhaseResult := VALIDATE_RECEIPT_PHASE(input.activation.receipt, input.phase)
  expected := input.activation.expected ?? DERIVE_EXPECTED_FROM_RECEIPT(input.activation.receipt)
  trackerResult := VALIDATE_TRACKER(input.tracker, input.phase, requiredSlugs)
  sparseResult := VALIDATE_TRACKER_SPARSE(input.tracker, requiredSlugs, depth)
  authoritativeResult := VALIDATE_TRACKER_AUTHORITATIVE(input.tracker, input.evidence.tracker_source)
  IF input.evidence.provenance present: VALIDATE_PROVENANCE_COMPLETE
  IF input.evidence gate_result or finding_ledger present: VALIDATE_FINDING_DISPOSITION
  IF input.evidence command_evidence present: VALIDATE_COMMAND_EVIDENCE
  IF input.evidence hash or cross_phase inputs present: VALIDATE_EVIDENCE_FRESHNESS
  IF close_out AND tree paths present: VALIDATE_CLOSE_OUT_TREE
  parentChildResult := VALIDATE_INTEGRATED_PARENT_CHILD_SLUGS(input.tracker, depth, input.phase)
  citdpResult := VALIDATE_ADVERSARIAL_CONTRACT(input.citdp, input.phase)
  IF depth requires integrated pairing AND close_out inquiry waiver does not apply AND activation is missing: append integrated_depth_requires_pairing
  IF depth requires integrated pairing AND activation is present: VALIDATE_ACTIVATION_PAIRING with expected
  minimalWaiverResult := VALIDATE_MINIMAL_WAIVER(citdp)
  blockingDiagnostics := NORMALIZE_REMEDIATION_DIAGNOSTICS(union of all blocking results above)
  advisoryDiagnostics := minimalWaiverResult warn-only codes
  IF blockingDiagnostics non-empty: RETURN blocked with union(blockingDiagnostics, advisoryDiagnostics)
  RETURN allowed with advisoryDiagnostics only when present

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: read persisted phase artifacts and assemble gate activation payload without writing artifacts or mutating CITDP.
procedure COLLECT_CHECKLIST_ACTIVATION(input):
  Contract:
  INPUT: request_token, phase, run_id, optional project_root, optional metrics_path
  PRE: phase is pre_implementation, verification, or close_out; request_token matches REQ-* pattern
  OUTPUT: { ok, receipt, artifacts, expected, diagnostics }
  POST: when ok, receipt and artifacts match runChecklistInquiry activation shape including artifact path under working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/; expected equals DERIVE_EXPECTED_FROM_RECEIPT(receipt); collector never writes files or mutates CITDP
  FAILURE_MODES: missing_phase_directory, missing_activation_artifact, malformed_obligation_report, run_id_provenance_mismatch, phase_provenance_mismatch, metrics_run_id_mismatch
  DATA: phase artifact paths, content hashes, optional metrics row for tied_adversarial_inquiry_run
  DATA_TRANSITION: artifact file contents become receipt, artifacts map, and expected identity projection
  EFFECTS: read-only filesystem and optional metrics JSONL
  TERMINATION: total
  paths := resolveArtifactPaths(project_root, request_token, phase)
  IF phase directory or any required artifact file is missing: RETURN failure
  report := read obligation-report.json; provenance := read evidence-provenance.json
  IF report scope or project_id missing: RETURN failure
  IF provenance run_id present AND differs from input run_id: RETURN run_id_provenance_mismatch
  IF provenance phase present AND differs from input phase: RETURN phase_provenance_mismatch
  FOR each required artifact: compute content hash; build artifact descriptor with path
  receipt := successful tied_adversarial_inquiry_run receipt with artifact_hashes
  expected := DERIVE_EXPECTED_FROM_RECEIPT(receipt)
  IF metrics_path supplied: locate metrics row with matching run_id; mismatch fails closed; absence is diagnostic only
  RETURN { receipt, artifacts, expected }

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: convert read-only checklist definition into clean per-request Authoritative Tracker state including gate-governed sub-procedures.
procedure MATERIALIZE_AUTHORITATIVE_TRACKER(definition_path, tracker_path, request_token):
  Contract:
  INPUT: definition_path, tracker_path, optional request_token
  PRE: definition_path is readable checklist YAML; tracker_path is not the canonical definition path; tracker_path differs from definition_path
  OUTPUT: materialized tracker map or error
  POST: every main step slug and sub-adversarial-inquiry-pass appear exactly once as pending rows with kind main or sub_procedure; execution_evidence.completed is empty; inherited dispositions, gate receipts, and close_out evidence are cleared; schema_version is checklist-tracker.v1; source_document equals definition_path
  FAILURE_MODES: definition_not_readable, tracker_path_is_definition, duplicate_slug, missing_gate_sub_procedure, invalid_definition
  DATA_TRANSITION: checklist definition steps and sub_procedures become tracker.steps pending rows; execution_evidence.request set from request_token when supplied
  EFFECTS: writes tracker_path atomically when materializing to disk
  TERMINATION: total
  IF tracker_path equals definition_path OR tracker_path is canonical definition: RETURN tracker_path_is_definition
  slugs := collect main step slugs from definition in document order
  IF sub-adversarial-inquiry-pass missing from sub_procedures: RETURN missing_gate_sub_procedure
  append sub-adversarial-inquiry-pass as sub_procedure row when not already present as main slug
  IF duplicate slug detected: RETURN duplicate_slug
  initialize every row disposition pending with no evidence, waiver, or gate fields
  set execution_evidence.completed to empty derived-compatible list
  WRITE tracker atomically

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: parse strict agentstream_tracker completion receipt from captured assistant transcript without mutating routing semantics.
procedure PARSE_TRACKER_COMPLETION_RECEIPT(transcript, expected_slug):
  Contract:
  INPUT: transcript text, expected_slug current StepStub
  PRE: expected_slug is non-empty when receipt is required
  OUTPUT: parsed receipt or absent; validation diagnostics on malformed input
  POST: when present, receipt slug equals expected_slug; disposition is completed, not_applicable, or waived with matching evidence contract; schema_version is 1; unknown fields rejected; generic skipped is invalid
  FAILURE_MODES: missing_receipt, malformed_receipt, wrong_slug, unsupported_schema, unknown_field, invalid_disposition, missing_disposition_evidence, skipped_disposition_rejected
  EFFECTS: pure
  TERMINATION: total
  scan fenced JSON blocks latest-first for agentstream_tracker envelope
  IF envelope missing: RETURN missing_receipt
  IF schema_version is not 1 OR unknown keys present: RETURN unsupported_schema or unknown_field
  IF slug differs from expected_slug: RETURN wrong_slug
  IF disposition is skipped: RETURN skipped_disposition_rejected
  validate disposition-specific evidence identically to VALIDATE_TRACKER row contract
  RETURN normalized receipt

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: merge one validated receipt into exactly one Tracker step and recompute derived compatibility summary only after authoritative write succeeds.
procedure APPLY_TRACKER_DISPOSITION(tracker_path, receipt, turn_identity):
  Contract:
  INPUT: tracker_path, validated receipt, turn_identity
  PRE: receipt passed PARSE_TRACKER_COMPLETION_RECEIPT; tracker_path exists and is writable
  OUTPUT: updated tracker or error
  POST: exactly one matching step changes disposition and evidence fields; unrelated tracker fields remain semantically equal; state_history appends bounded audit entry unless idempotent replay; execution_evidence.completed is derived from completed step slugs after write; prior file bytes remain valid on any failure
  FAILURE_MODES: tracker_not_found, step_not_found, conflicting_replay, write_failure, validation_failure
  DATA_TRANSITION: receipt fields merge into matching steps row; execution_evidence.completed regenerated from steps
  EFFECTS: atomic filesystem write via same-directory temp file, fsync, rename
  TERMINATION: total
  prior := read tracker_path
  IF prior state_history contains same turn_identity and receipt hash: RETURN success idempotent
  IF prior state_history contains same turn_identity and different receipt hash: RETURN conflicting_replay
  updated := merge receipt into exactly one step row
  updated.execution_evidence.completed := derive completed slugs from steps only
  append state_history entry with turn_identity, receipt hash, updated_at
  WRITE updated atomically; on failure leave prior unchanged

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: apply loop_back_clearance target slugs by resetting downstream dispositions and evidence before queue replacement.
procedure INVALIDATE_TRACKER_DOWNSTREAM(tracker_path, definition_path, goto_target):
  Contract:
  INPUT: tracker_path, definition_path, goto_target slug
  PRE: definition_path exposes loop_back_clearance for goto_target; tracker_path is Authoritative Tracker
  OUTPUT: updated tracker or error
  POST: every configured clear_slug row returns to pending with disposition evidence, waiver fields, gate summaries, and derived execution_evidence.completed entries cleared; checklist definition bytes never change
  FAILURE_MODES: missing_clear_target, missing_state_row, write_failure
  DATA_TRANSITION: listed step rows reset to pending; execution_evidence.completed and close_out gate summaries cleared for affected slugs
  EFFECTS: atomic filesystem write
  TERMINATION: total
  clear_slugs := definition.loop_back_clearance[goto_target].clear_slugs
  IF clear_slugs missing or empty: RETURN missing_clear_target
  FOR each slug in clear_slugs: IF tracker row missing THEN RETURN missing_state_row; reset row to pending and clear evidence
  recompute execution_evidence.completed from remaining completed rows
  WRITE tracker atomically; on failure leave prior unchanged

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: wire executor transcript through receipt parser and writer before advancing checklist turns; route goto through downstream invalidation first.
procedure COMPOSE_TRACKER_WITH_CHECKLIST_GATE(cfg, turn, transcript):
  Contract:
  INPUT: cfg with definition_path and tracker_path, current turn, captured transcript
  PRE: when turn.StepStub is non-empty and control action is not goto, a valid current-step receipt is required; tracker_path must not equal definition_path
  OUTPUT: progression allowed or process exit non-zero
  POST: checklist turn N+1 never runs without successful APPLY_TRACKER_DISPOSITION for turn N unless goto invalidated downstream first; non-checklist turns skip receipt requirement; canonical checklist bytes remain unchanged; writer output is consumable by VALIDATE_CHECKLIST_GATE without synthetic adapter
  FAILURE_MODES: missing_receipt, malformed_receipt, wrong_slug, tracker_write_failure, loop_back_persistence_failure, tracker_path_is_definition
  DATA_TRANSITION: transcript to receipt to tracker state; goto replaces remaining queue after INVALIDATE_TRACKER_DOWNSTREAM succeeds
  EFFECTS: mutates tracker_path only; never mutates definition_path
  TERMINATION: total
  IF tracker_path missing on disk: MATERIALIZE_AUTHORITATIVE_TRACKER
  IF existing tracker: validate source_document and request_token identity against cfg
  decision := PARSE agentstream_control from transcript when present
  IF decision.action is goto: INVALIDATE_TRACKER_DOWNSTREAM then allow routing without current-step completion receipt
  ELSE IF turn.StepStub is non-empty:
    receipt := PARSE_TRACKER_COMPLETION_RECEIPT(transcript, turn.StepStub)
    APPLY_TRACKER_DISPOSITION with turn identity
  ELSE: allow progression without receipt
  RETURN allow next turn

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: persist CITDP using open-record validation; progression gates remain separate.
procedure WRITE_CITDP_RECORD(filename, record): # [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
  INPUT: filename basename, record map
  PRE: filename matches CITDP-*.yaml
  OUTPUT: write result or error
  POST: when overwriting, incoming record inherits existing prior_depth_tier when omitted; validation uses VALIDATE_CITDP_OPEN_RECORD with existing depth before merge; verification and close_out gates still require pairing via VALIDATE_CHECKLIST_GATE
  FAILURE_MODES: invalid_filename, invalid_adversarial_citdp, io_error
  EFFECTS: writes tied/citdp file atomically
  TERMINATION: total
  existing := read existing file when present
  merged := merge prior_depth_tier from existing when incoming omits it
  openResult := VALIDATE_CITDP_OPEN_RECORD(merged, existing depth_tier, activation from merged)
  IF openResult fails: RETURN error
  WRITE canonical YAML atomically
  RETURN success

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: hash rendered turn prompt bytes and append instruction_rendered adherence event before subprocess.
procedure RENDER_INSTRUCTION_EVIDENCE(turn, cfg, ledger_path):
  Contract:
  INPUT: turn with Parts, cfg with request_token and run_id, ledger_path
  PRE: turn.StepStub is non-empty for checklist turns; ledger_path is writable under working/{REQ-TOKEN}/adherence/
  OUTPUT: instruction_nonce and instruction_hash for current turn
  POST: instruction_hash equals stable hash of rendered Parts bytes; instruction_nonce is unique per turn_index; agent-adherence-event.v1 row with event_class instruction_rendered appended before executor.Run
  FAILURE_MODES: ledger_write_failure, missing_request_token, empty_turn_parts
  DATA: instruction_nonce, instruction_hash, rendered_bytes
  DATA_TRANSITION: rendered Parts become hashed correlation fields and append-only JSONL row
  EFFECTS: append-only write to ledger_path
  TERMINATION: total
  rendered := join turn.Parts with canonical separator
  instruction_hash := sha256(rendered)
  instruction_nonce := issue UUID or monotonic counter scoped to run_id and turn_index
  event := agent-adherence-event.v1 row with correlation request_token, run_id, turn_index, step_slug, instruction_hash, instruction_nonce, source_revision
  APPEND event to ledger_path atomically
  RETURN instruction_nonce, instruction_hash

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: separate final assistant text from thinking stream so receipt scan excludes non-final content.
procedure SEPARATE_FINAL_ASSISTANT_TEXT(run_result):
  Contract:
  INPUT: executor RunResult with FinalText, ThinkingText, Transcript
  PRE: RunResult produced by stream-json executor
  OUTPUT: receipt_scan_text bucket
  POST: receipt_scan_text equals FinalText only; ThinkingText and reasoning blocks are excluded; Transcript retains full audit trail unchanged
  FAILURE_MODES: missing_final_text
  EFFECTS: pure projection
  TERMINATION: total
  IF FinalText is empty AND Transcript contains no assistant content: RETURN missing_final_text
  RETURN FinalText as receipt_scan_text

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate Tracker completion receipt binding fields against issued instruction for current turn.
procedure BIND_RECEIPT_TO_INSTRUCTION(receipt, issued_nonce, issued_hash, turn_identity):
  Contract:
  INPUT: parsed agentstream_tracker receipt, issued instruction_nonce and instruction_hash, turn_identity
  PRE: receipt passed PARSE_TRACKER_COMPLETION_RECEIPT shape validation
  OUTPUT: bound receipt or error
  POST: receipt instruction_nonce equals issued_nonce; receipt instruction_hash equals issued_hash; receipt request_token and run_id match cfg; stale nonce or copied prior-turn hash fails
  FAILURE_MODES: missing_binding_fields, stale_instruction_nonce, instruction_hash_mismatch, request_token_mismatch, run_id_mismatch, copied_prior_hash
  EFFECTS: pure
  TERMINATION: total
  IF receipt lacks instruction_nonce or instruction_hash: RETURN missing_binding_fields
  IF receipt instruction_nonce differs from issued_nonce: RETURN stale_instruction_nonce
  IF receipt instruction_hash differs from issued_hash: RETURN instruction_hash_mismatch
  IF receipt hash matches prior turn but nonce differs or vice versa: RETURN copied_prior_hash
  RETURN bound receipt

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: resolve completed disposition evidence_refs to files, manifests, or command receipts before Tracker write.
procedure RESOLVE_EVIDENCE_REFS(receipt, project_root):
  Contract:
  INPUT: validated receipt with evidence_refs[], project_root
  PRE: receipt disposition is completed; evidence_refs is non-empty
  OUTPUT: resolution result with artifact hashes or diagnostics
  POST: every ref resolves to existing file with recorded hash, valid verification-evidence-manifest.v1 with exit_code zero, or command evidence passing VALIDATE_COMMAND_EVIDENCE; generic prose refs fail
  FAILURE_MODES: unresolved_evidence_ref, manifest_exit_nonzero, command_success_unproven, missing_artifact
  DATA: resolved_refs with artifact_ref and artifact_hash
  EFFECTS: read-only filesystem and manifest inspection
  TERMINATION: total
  FOR each ref in evidence_refs:
    IF ref matches generic prose pattern: RETURN unresolved_evidence_ref
    IF ref is file path: require exists; record sha256
    IF ref is manifest reference: load verification-evidence-manifest.v1; reject exit_code != 0
    IF ref is command evidence map: VALIDATE_COMMAND_EVIDENCE
  RETURN resolved_refs for outcome_verified ledger append

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: persist raw checklist evidence gate decision with input Tracker/CITDP hash for reconciliation.
procedure PERSIST_GATE_DECISION_RECEIPT(gate_result, input_hashes, gates_dir):
  Contract:
  INPUT: gate_result from tied_checklist_gate_validate, input_hashes for tracker and citdp, gates_dir
  PRE: phase is pre_implementation, verification, or close_out; gates_dir is under working/{REQ-TOKEN}/gates/
  OUTPUT: persisted gate receipt path and content hash
  POST: JSON file written atomically with phase, timestamp, allowed, diagnostics, depth, input tracker_hash and citdp_hash; agent-adherence-event.v1 gate_decided row appended with artifact_ref pointing to file
  FAILURE_MODES: gate_receipt_write_failure, missing_input_hash
  DATA: gate_receipt_path, gate_receipt_hash
  DATA_TRANSITION: gate_result plus input_hashes become durable JSON and ledger correlation edge
  EFFECTS: atomic filesystem write and ledger append
  TERMINATION: total
  IF tracker_hash or citdp_hash missing: RETURN missing_input_hash
  path := gates_dir/{phase}-{timestamp}.json
  WRITE gate_result and input_hashes atomically to path
  APPEND gate_decided adherence event with artifact_ref path and gate_receipt_hash
  RETURN path, gate_receipt_hash

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: persist tied_verify status mutation receipt linking previous and next statuses to gate receipt.
procedure PERSIST_STATUS_MUTATION_RECEIPT(verify_result, gate_receipt_ref, ledger_path):
  Contract:
  INPUT: tied_verify dry_run or apply result, gate_receipt_ref path/hash, ledger_path
  PRE: verify_result includes previous_status to next_status map per token; gate_receipt_ref points to persisted gate JSON
  OUTPUT: status mutation receipt or error
  POST: status_mutated adherence event records token-level diffs and gate_receipt_ref; no status write occurs without prior gate_decided receipt reference when mutation applied
  FAILURE_MODES: missing_gate_receipt_ref, verify_no_op, ledger_write_failure
  DATA: status_mutation_map, gate_receipt_ref
  DATA_TRANSITION: verify_result diff becomes status_mutated ledger row with gate correlation
  EFFECTS: append-only ledger write; verify apply may mutate TIED indexes separately
  TERMINATION: total
  IF verify_result would_update is empty: RETURN verify_no_op
  IF mutation applied AND gate_receipt_ref missing: RETURN missing_gate_receipt_ref
  APPEND status_mutated event with previous/next map and gate_receipt_ref
  RETURN success

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: read-only reconciliation comparing six event classes and emitting deterministic findings without mutating Tracker or TIED YAML.
procedure RECONCILE_ADHERENCE_CHAIN(ledger_path, tracker_path, tied_indexes, gates_dir): # [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
  INPUT: adherence ledger JSONL, Authoritative Tracker, TIED index snapshots, gates directory
  PRE: ledger_path may be absent for legacy requests
  OUTPUT: reconciliation report with finding codes and correlation gaps
  POST: emits rendered_without_acknowledgment, acknowledged_without_attempt, attempt_without_verified_outcome, completed_with_unresolved_evidence, gate_without_current_evidence, status_change_without_verification_receipt, or legacy_no_adherence_chain; report is observational only and never mutates inputs
  FAILURE_MODES: malformed_ledger_row, missing_correlation_field
  DATA: findings list with codes and turn/slug correlation
  DATA_TRANSITION: ledger rows, Tracker steps, gate receipts, and TIED index snapshots project into read-only findings list
  EFFECTS: read-only filesystem inspection; no Tracker or TIED YAML writes
  TERMINATION: total
  IF ledger_path absent: RECORD legacy_no_adherence_chain finding for request
  rows := load and validate agent-adherence-event.v1 rows
  FOR each instruction_rendered without matching agent_acknowledged: RECORD rendered_without_acknowledgment finding
  FOR each agent_acknowledged without action_attempted for declared evidence_refs: RECORD acknowledged_without_attempt finding
  FOR each action_attempted without outcome_verified hash match: RECORD attempt_without_verified_outcome finding
  FOR each Tracker completed step with failed RESOLVE_EVIDENCE_REFS: RECORD completed_with_unresolved_evidence finding
  FOR each gate_decided receipt whose input hash differs from current Tracker/CITDP: RECORD gate_without_current_evidence finding
  FOR each TIED status change without status_mutated row referencing gate receipt: RECORD status_change_without_verification_receipt finding
  RETURN findings report
