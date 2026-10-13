# [IMPL-TIED_METHODOLOGY_COMPOSITION_MATRIX] [ARCH-TIED_METHODOLOGY_COMPOSITION_MATRIX] [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX]
# Docs-only: author matrix markdown and cross-links; validate row counts and TIED consistency.

PROCEDURE MAINTAIN_METHODOLOGY_COMPOSITION_MATRIX
  # Implements REQ satisfaction via structure + links, not external certification.
  PRE: pre_implementation gate allowed; source comparison docs unchanged in claims.
  POST: matrix file exists; §1 row count = 27; §2 row count = 10; mechanism cells _TBD_.

  STEP AUTHOR_MATRIX
    # [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX] Write docs/comparisons/methodology-composition-matrix.md §0–§3.
    OUTPUT matrix_md WITH enumerated §1/§2 inventories FROM working PLAN.

  STEP CROSS_LINK
    # [ARCH-TIED_METHODOLOGY_COMPOSITION_MATRIX] Patch sibling comparison Related docs sections.
    EFFECTS: well_known_doc and qmm_doc link to matrix §1.

  STEP VALIDATE
    # [IMPL-TIED_METHODOLOGY_COMPOSITION_MATRIX] lint_yaml on project YAML; tied_validate_consistency.
    POST: consistency pass OR documented diagnostics.

END PROCEDURE
