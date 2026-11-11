# [IMPL-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [ARCH-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK]

Grammar-Version: v2

## RUN_COMPOSITION_EVIDENCE_SUBCHECK

- [IMPL-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [ARCH-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] Lens A subcheck for WF-09..12 readouts; evidence-only verdict.
procedure RUN_COMPOSITION_EVIDENCE_SUBCHECK:
  Contract:
    INPUT: repo_root, optional prompt_id, optional manifest_path, optional primary_lens
    OUTPUT: wf-composition-evidence-subcheck.v2 payload
    PRE: validator_version 1.2.0 snapshot available when tied-project present
    POST: histogram markdown derived from label_case_counts
    EFFECTS: read-only snapshot + advisory manifest validate
  BUILD snapshot 1.2.0 WITH optional manifest override
  DISCOVER manifest path WHEN manifest_path omitted
  IF manifest_present THEN validateWfProofManifest advisory reconcile
  COMPUTE binding_test_present FROM labels OR manifest bindings OR inference count
  SET composition_evidence_subcheck FROM prompt_id cohort rule
  RETURN v2 object
