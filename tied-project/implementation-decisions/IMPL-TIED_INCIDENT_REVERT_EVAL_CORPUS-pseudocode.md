# IMPL-TIED_INCIDENT_REVERT_EVAL_CORPUS — essence pseudocode

<!-- [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS] [ARCH-TIED_INCIDENT_REVERT_EVAL_CORPUS] [IMPL-TIED_INCIDENT_REVERT_EVAL_CORPUS] Doc-only Phase 4; guide + example template; no MCP modules. -->

```
PROCEDURE MAINTAIN_INCIDENT_REVERT_EVAL_CORPUS_GUIDE
  // Implements REQ: Loop 3 bounded evaluation corpus guide under tied-bundle/docs.
  INPUT: guide_markdown_path, example_template_path, client_development_index_path
  OUTPUT: refreshed_install_surface
  PRE: proof_boundary forbids W6 QMM reopen and new gate authority
  POST: bootstrap test markers and template schema_version present
  EFFECTS: tied-install copies doc and template on refresh

  BLOCK EDIT_GUIDE_MARKDOWN
    // ARCH: tied-bundle/docs/incident-revert-evaluation-corpus.md
    write sections: Proof boundary, Case kinds, Evaluation corpus rows,
      Pilot bounds and stop criteria, Compose with closed Loop 3 programs

  BLOCK SHIP_EXAMPLE_TEMPLATE
    // REQ SC-TEMPLATE-EXAMPLE
    write evaluation-corpus-incident-revert-rows.v1.example.yaml with case_kind rows

  BLOCK UPDATE_CLIENT_INDEX_QUICK_READ
    // REQ SC-INDEX-LINK
    append Quick read row linking guide

  BLOCK VERIFY_DOC_CONTRACT
    // IMPL test incident-revert-eval-corpus-doc.test.mjs
    run node --test; exit 0 required
END PROCEDURE
```
