# IMPL-TIED_DAE_VERIFICATION_CHARTER — essence_pseudocode

<!-- [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER] — Charter-opt-in verification plugins composing checklist gate validate. -->

PROGRAM CHARTER_VERIFICATION_PLUGINS
  // [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
  // How: Gate all charter tools on CITDP record_identity.verification_charter == true; default skip.

ACTIVE PROCEDURE OPTIONAL_CHARTER_MUTATION_CACHE
  // [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
  // How: W4a diff-scoped mutation score after green suite; fail verification-gate below threshold.
  INPUT citdp
  INPUT diff_paths
  INPUT cache_dir
  PRE verification_charter == true AND mutation_cache == true to run
  POST manifest + score emitted; action fail when score < threshold
  EFFECTS cache under project policy path only when enabled
  FAILURE_MODES cache_miss -> score 0; below_threshold -> verification blocked
END ACTIVE PROCEDURE

ACTIVE PROCEDURE HARDEN_DISJOINT_VERIFIER_IN_GATE_VALIDATE
  // [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
  // How: W4b extend validateChecklistGate when disjoint_verifier == required.
  INPUT citdp
  INPUT adherence_ledger
  INPUT verifier_session_id
  PRE phase IN {verification, close_out}
  PRE disjoint_verifier == required to enforce
  POST allowed false when implementer_session_id == verifier_session_id without waiver
  EFFECTS diagnostics include disjoint_verifier_same_session
  FAILURE_MODES same_session_without_waiver -> gate blocked
END ACTIVE PROCEDURE

ACTIVE PROCEDURE OPTIONAL_GAUNTLET_BLOCK_ON_CITDP
  // [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
  // How: W4c parse gauntlet probes after composition green, before E2E justification.
  INPUT citdp_or_impl
  PRE gauntlet block present AND verification_charter == true
  POST probe results recorded under working/{REQ}/evidence/
  EFFECTS evidence only; default off when block absent
END ACTIVE PROCEDURE
