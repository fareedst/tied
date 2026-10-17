# IMPL-TIED_REVIEW_CONVERGENCE_POLICY — essence pseudocode

<!-- [REQ-TIED_REVIEW_CONVERGENCE_POLICY] [ARCH-TIED_REVIEW_CONVERGENCE_POLICY] [IMPL-TIED_REVIEW_CONVERGENCE_POLICY] Doc-only Phase 3; maintains review-convergence-policy.md and index link. -->

```
PROCEDURE MAINTAIN_REVIEW_CONVERGENCE_POLICY
  // Implements REQ: Loop 2 advisory policy under tied-bundle/docs; no MCP modules.
  INPUT: policy_markdown_path, client_development_index_path
  OUTPUT: refreshed_install_surface
  PRE: proof_boundary states no new checklist gate authority
  POST: bootstrap test markers present
  EFFECTS: tied-install copies doc to clients on refresh

  BLOCK EDIT_POLICY_MARKDOWN
    // ARCH: canonical path tied-bundle/docs/review-convergence-policy.md
    write sections: Proof boundary, Review round cap, Diff-only re-review,
      Repeated-finding suppression, Class-level fixes, Kaizen measurement

  BLOCK UPDATE_CLIENT_INDEX_QUICK_READ
    // REQ SC-INDEX-LINK
    append Quick read row linking policy

  BLOCK VERIFY_DOC_CONTRACT
    // IMPL test review-convergence-policy-doc.test.mjs
    run node --test; exit 0 required
END PROCEDURE
```
