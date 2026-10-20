# IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION — essence pseudocode

## LINT_DOC_DECOMMISSION_ON_LIVE_SURFACES
<!-- [IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] [ARCH-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] [REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] How: Layer B patterns on .md/.yaml/.yml only; allowlist REQ/CITDP/ARCH/IMPL detail trees for behavioral migrate criteria. -->

```
PROCEDURE LINT_DOC_DECOMMISSION_ON_LIVE_SURFACES(repoRoot)
  // PRE: repoRoot is TIED store or client with live surface roots configured.
  // POST: findings[] empty when user-facing prose omits legacy tied/ narrative and --migrate-layout.
  // EFFECTS: scans LIVE_SURFACE_ROOTS; applies DOC_DECOMMISSION_PATTERNS only when extension in {.md,.yaml,.yml}.
  FOR EACH file IN walkLiveSurfaces(repoRoot):
    IF extension(file) NOT IN DOC_DECOMMISSION_EXTENSIONS: CONTINUE
    FOR EACH line IN readLines(file):
      FOR EACH pat IN DOC_DECOMMISSION_PATTERNS:
        IF pat.matches(line) AND NOT isAllowlistedStaleHit(file, pat.id):
          APPEND findings(file, line, pat)
  RETURN ok(findings.empty)
```

## UPDATE_STORE_README_STRUCTURE_TEST
<!-- [IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE] How: forbid legacy layout doc patterns; require --refresh in README contract. -->

```
PROCEDURE UPDATE_STORE_README_STRUCTURE_TEST()
  // PRE: README.md edited to two-folder-only operator prose.
  // POST: REQUIRED_SUBSTRINGS includes --refresh; FORBIDDEN_LEGACY_LAYOUT_DOC_PATTERNS do not match README.
  ASSERT README contains tied-install.sh --help AND --refresh
  ASSERT README does NOT match migrate-layout OR legacy `tied/` layout narrative
```

## SYNC_INSTALL_RESOURCE_MATRIX_VERIFY
<!-- [IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] [REQ-TIED_LAYERED_CLIENT_INSTALL] How: matrix doc sync check requires tied-project, tied-bundle, tied-install, --refresh (not migrate-layout in markdown). -->

```
PROCEDURE SYNC_INSTALL_RESOURCE_MATRIX_VERIFY()
  // PRE: install-resource-matrix.md updated.
  // POST: verifyInstallResourceMatrixDoc returns ok.
  READ matrix text
  ASSERT contains tied-project, tied-bundle, tied-install, --refresh
```
