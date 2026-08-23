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
  POST: receipt and every required artifact match the expected identity; receipt hashes equal artifact hashes; expected scope_hash equals the stable scope hash
  FAILURE_MODES: missing_receipt, unsuccessful_receipt, missing_expected_identity, missing_activation_artifact, invalid_activation_artifact, artifact_hash_mismatch, stale_identity
  DATA: receipt, artifacts, expected, artifact_hashes
  EFFECTS: pure
  TERMINATION: total
  IF receipt is missing or receipt.success is not true: RETURN failure missing_or_unsuccessful_inquiry_receipt
  IF receipt.tool is not tied_adversarial_inquiry_run: RETURN failure invalid_inquiry_tool
  FOR each required artifact name in obligation-report.json, finding-ledger.jsonl, gate-result.json, evidence-provenance.json:
    IF artifact is missing or artifact.valid is not true or artifact.hash is empty: RETURN failure
    IF artifact identity differs from expected: RETURN stale_identity
  IF receipt identity or scope hash differs from expected: RETURN stale_identity
  IF receipt artifact hashes differ from artifact hashes: RETURN artifact_hash_mismatch
  RETURN successful pairing with artifact_hashes

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive auto-required Tracker slugs from depth and gate phase; caller slugs union only.
procedure DERIVE_PHASE_AWARE_SLUGS(depth, phase):
  Contract:
  INPUT: depth, phase
  PRE: depth is minimal, integrated, or strict_candidate and phase is an allowed gate phase
  OUTPUT: ordered slug list
  POST: integrated depth returns INTEGRATED_REQUIRED_SLUGS for the phase; strict_candidate returns the same set only at verification and close_out; minimal and strict_candidate at pre_implementation return empty
  FAILURE_MODES: invalid_phase
  EFFECTS: pure
  TERMINATION: total
  IF depth is integrated: RETURN INTEGRATED_REQUIRED_SLUGS[phase]
  IF depth is strict_candidate AND phase is verification or close_out: RETURN INTEGRATED_REQUIRED_SLUGS[phase]
  RETURN empty slug list

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
  trackerResult := VALIDATE_TRACKER(input.tracker, input.phase, requiredSlugs)
  citdpResult := VALIDATE_ADVERSARIAL_CONTRACT(input.citdp, input.phase)
  IF depth requires integrated pairing AND close_out inquiry waiver does not apply AND activation is missing: append integrated_depth_requires_pairing
  IF depth requires integrated pairing AND activation is present: VALIDATE_ACTIVATION_PAIRING
  IF any result fails: RETURN blocked diagnostics
  RETURN allowed result
