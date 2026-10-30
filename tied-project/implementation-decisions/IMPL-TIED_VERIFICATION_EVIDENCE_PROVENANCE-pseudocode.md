# [IMPL-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [ARCH-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [REQ-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [REQ-TIED_INTENT_CONTROL_PLANE] — Wave 3 trusted verify manifest binding.

Grammar-Version: v2

## VALIDATE_VERIFY_MANIFEST_PROVENANCE

procedure VALIDATE_VERIFY_MANIFEST_PROVENANCE(input):
  Contract:
    INPUT: tied_base_path, verification_manifest_path, passed_requirement_tokens, passed_impl_tokens, optional current_commit
    PRE: tied_verify may promote REQ/IMPL status after checklist gate allows
    OUTPUT: ok | blocked with diagnostics
    POST: when enforcement on and promoting tokens, every passed token ⊆ manifest.covered_tokens; manifest command_results all passed; optional commit match
    FAILURE_MODES: missing_verification_manifest; untrusted_pass_token; evidence_stale; failed_command_result
    EFFECTS: pure
    TERMINATION: total

  # [IMPL-TIED_VERIFICATION_EVIDENCE_PROVENANCE] — How: REQ-CTRL-005/011 — untrusted pass lists and stale manifests cannot confer verified status.
  IF verification.require_manifest_provenance is false in project config: RETURN ok
  IF no REQ/IMPL tokens requested for promotion: RETURN ok
  IF manifest path missing: RETURN missing_verification_manifest
  Load verification-evidence-manifest.v1.json
  FOR each passed token: IF not in covered_tokens RETURN untrusted_pass_token (CASE-002)
  FOR each command_result: IF result is failed RETURN failed_command_result
  IF current_commit supplied AND manifest.commit differs: RETURN evidence_stale (CASE-005)
  RETURN ok

## TIED_VERIFY_HOOK

procedure TIED_VERIFY_AFTER_GATE(input):
  Contract:
    INPUT: verify options after checklist gate allowed
    PRE: gate.allowed is true
    OUTPUT: verify result or VERIFY_MANIFEST_BLOCKED
    POST: index status unchanged when provenance blocked
    FAILURE_MODES: VERIFY_MANIFEST_BLOCKED
    DATA_TRANSITION: no index mutation when blocked
    EFFECTS: pure until promotion proceeds
    TERMINATION: total
  # [IMPL-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [PROC-TIED_VERIFICATION_GATED] — How: invoke provenance validator after validateChecklistGate and before index writes.
  CALL VALIDATE_VERIFY_MANIFEST_PROVENANCE
  IF blocked: RETURN VERIFY_MANIFEST_BLOCKED without mutating indexes
