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
  POST: minimal depth has counterexamples, falsification questions, disconfirming observations, and evidence references; integrated depth has valid activation pairing
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

# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: select depth before evaluating phase gates and fail closed on invalid evidence.
 procedure VALIDATE_CHECKLIST_GATE(input): # [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  Contract:
  INPUT: tracker, citdp, activation, phase
  PRE: phase is selected before this procedure is called
  OUTPUT: { allowed, diagnostics, depth, blocking }
  POST: allowed is true only when every required contract passes; advisory policy may warn only after required evidence is valid
  FAILURE_MODES: malformed_input, tracker_failure, citdp_failure, activation_failure
  EFFECTS: pure
  TERMINATION: total
  trackerResult := VALIDATE_TRACKER(input.tracker, input.phase)
  citdpResult := VALIDATE_ADVERSARIAL_CONTRACT(input.citdp, input.phase)
  IF any result fails: RETURN blocked diagnostics
  RETURN allowed result
