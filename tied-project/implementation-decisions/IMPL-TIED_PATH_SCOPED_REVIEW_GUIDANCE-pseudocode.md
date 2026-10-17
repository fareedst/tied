# IMPL-TIED_PATH_SCOPED_REVIEW_GUIDANCE — essence pseudocode

<!-- [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE] [ARCH-TIED_PATH_SCOPED_REVIEW_GUIDANCE] [IMPL-TIED_PATH_SCOPED_REVIEW_GUIDANCE] Doc-only; client-owned REVIEW.md pattern; no MCP modules. -->

```
PROCEDURE MAINTAIN_PATH_SCOPED_REVIEW_GUIDANCE
  // Implements REQ: Optional path-scoped REVIEW.md / tied-project/review/ client pattern.
  INPUT: guide_markdown_path, example_template_paths, client_development_index_path
  OUTPUT: refreshed_methodology_doc_surface
  PRE: proof_boundary forbids MCP gate authority and mandatory PR-bot adoption
  POST: bootstrap test markers and template schema labels present
  EFFECTS: tied-install copies guide and templates on refresh; client copies examples manually

  BLOCK EDIT_GUIDANCE_MARKDOWN
    // ARCH: tied-bundle/docs/path-scoped-review-guidance.md
    write sections: Proof boundary, Layout patterns, Discovery, Compose table

  BLOCK SHIP_EXAMPLE_TEMPLATES
    // REQ SC-TEMPLATE-EXAMPLES
    write path-scoped-REVIEW.v1.example.md and tied-project-review-index.v1.example.md

  BLOCK UPDATE_CLIENT_INDEX_QUICK_READ
    // REQ SC-INDEX-LINK
    append Quick read row linking guide

  BLOCK VERIFY_DOC_CONTRACT
    // IMPL test path-scoped-review-guidance-doc.test.mjs
    run node --test; exit 0 required
END PROCEDURE
```
