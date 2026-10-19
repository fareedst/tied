# [IMPL-TIED_EDPC_PUBLISH] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] — SCM publish manifest builder

Grammar-Version: v2

## Publish manifest

procedure BUILD_EDPC_PUBLISH_MANIFEST:
  # [IMPL-TIED_EDPC_PUBLISH] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
  # How: Merge scm shell, claims ledger, tier, and EASAR receipt refs; record gaps when tier blocks Observed claims.
  Contract:
    INPUT: scm_shell, claims_ledger, access_matrix, receipt_refs
    OUTPUT: publish_manifest
    PRE: scm_shell schema_version is scm-snapshot-shell.v1
    POST: publish_manifest lists gaps[] when minimum fields missing or tier blocks claim class; receipt refs resolved or gap entry
    EFFECTS: pure
    FAILURE_MODES: invalid_scm_shell; unresolved_receipt_ref
    TERMINATION: total
  CALL checkMinimumScmFields(scm_shell)
  CALL classifyClaimsForTier(claims_ledger, access_matrix.evidence_access_tier)
  CALL resolveEasarReceiptRefs(receipt_refs)
  CALL stableSortManifestKeys(publish_manifest)
  RETURN publish_manifest

procedure CLASSIFY_CLAIMS_FOR_TIER:
  # [IMPL-TIED_EDPC_PUBLISH] [REQ-TIED_EDPC_COMPREHENSION] [IMPL-TIED_EDPC_ACCESS]
  # How: source_static material claims cannot be Observed/Verified without evidence_gap queue entry.
  Contract:
    INPUT: claims_ledger, tier
    OUTPUT: gaps, normalized_claims
    PRE: claims_ledger rows include claim_class
    POST: gaps[] populated when tier forbids claim_class
    EFFECTS: pure
    TERMINATION: total
  FOR EACH claim IN claims_ledger DO
    IF tier IS source_static AND claim.claim_class IN (Observed, Verified) THEN APPEND gap evidence_gap
  RETURN gaps, normalized_claims

procedure MCP_TIED_EDPC_PUBLISH_BUILD:
  # [IMPL-TIED_EDPC_PUBLISH] [REQ-TIED_EDPC_COMPREHENSION]
  # How: MCP wrapper reading artifact paths under working evidence/edpc and writing edpc-publish-manifest.v1.json.
  Contract:
    INPUT: artifact_paths, output_path, project_root
    OUTPUT: build_result
    PRE: paths under project working root
    POST: manifest written when output_path set
    EFFECTS: read artifacts; write manifest JSON
    TERMINATION: total
  CALL loadArtifacts(artifact_paths)
  CALL BUILD_EDPC_PUBLISH_MANIFEST
  IF output_path THEN writeJson(output_path, publish_manifest)
  RETURN build_result
