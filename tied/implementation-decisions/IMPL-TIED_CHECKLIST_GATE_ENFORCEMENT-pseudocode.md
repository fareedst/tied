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

## VALIDATE_CHECKLIST_GATE
# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: select depth before evaluating phase gates and fail closed on invalid evidence.

procedure VALIDATE_CHECKLIST_GATE(input): # [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
  INPUT: tracker, citdp, activation, phase, required_step_slugs, prior_depth_tier
  PRE: phase is selected before this procedure is called
  OUTPUT: { allowed, diagnostics, depth, blocking }
  POST: allowed is true only when every required contract passes; auto slugs union with caller slugs; integrated or late strict_candidate pairing is mandatory unless close_out inquiry waiver applies; advisory policy may warn only after required evidence is valid
  FAILURE_MODES: malformed_input, tracker_failure, citdp_failure, activation_failure, integrated_depth_requires_pairing, depth_downgrade_requires_waiver, missing_completion_activation, receipt_identity_mismatch:phase
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
  parentChildResult := VALIDATE_INTEGRATED_PARENT_CHILD_SLUGS(input.tracker, depth, input.phase)
  citdpResult := VALIDATE_ADVERSARIAL_CONTRACT(input.citdp, input.phase)
  IF depth requires integrated pairing AND close_out inquiry waiver does not apply AND activation is missing: append integrated_depth_requires_pairing
  IF depth requires integrated pairing AND activation is present: VALIDATE_ACTIVATION_PAIRING with expected
  minimalWaiverResult := VALIDATE_MINIMAL_WAIVER(citdp)
  blockingDiagnostics := union of all blocking results above
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
