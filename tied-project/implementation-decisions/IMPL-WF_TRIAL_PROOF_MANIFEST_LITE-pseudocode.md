# [IMPL-WF_TRIAL_PROOF_MANIFEST_LITE] [ARCH-WF_TRIAL_PROOF_MANIFEST_LITE] [REQ-WF_TRIAL_PROOF_MANIFEST_LITE]

Grammar-Version: v2

## VALIDATE_WF_PROOF_MANIFEST

- [IMPL-WF_TRIAL_PROOF_MANIFEST_LITE] [ARCH-WF_TRIAL_PROOF_MANIFEST_LITE] [REQ-WF_TRIAL_PROOF_MANIFEST_LITE] Advisory validation of agent-declared proof labels; manifest overrides label_case_counts only.
procedure VALIDATE_WF_PROOF_MANIFEST:
  Contract:
    INPUT: repo_root, manifest JSON or path, blocking flag
    OUTPUT: ok, errors, label_reconcile_diagnostics, advisory
    PRE: schema_version proof-facet-manifest.v1
    POST: unknown proof_subtype rejected; files exist on disk
    EFFECTS: read-only; optional snapshot reconcile
  VALIDATE shape and subtype enum
  FOR each files row VERIFY path exists
  COMPARE manifest subtype to path-only resolve; record diagnostics
  IF reconcile THEN buildProjectSizeSnapshot WITH proof_facet_manifest
  RETURN ok per advisory policy
