# [IMPL-TIED_STORE_README_SECTIONS] [ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]
# How: Structure test and manual doctor replay enforce README band contracts.

PROCEDURE VERIFY_README_STRUCTURE
  # [IMPL-TIED_STORE_README_SECTIONS] [ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]
  # PRE: Repo root README.md exists.
  # POST: Three normative H2 bands present in order; required links; no forbidden certification claims.
  INPUT repo_root_abs
  CONTROL run_structure_test
  EFFECTS none on runtime
  FAILURE_MODES missing_band; missing_link; forbidden_claim

  IF run_structure_test THEN
    # [IMPL-TIED_STORE_README_SECTIONS] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]
    # How: node --import tsx --test mcp-server/src/store-readme-structure.test.ts
    INVOKE node --import tsx --test AT mcp-server/src/store-readme-structure.test.ts
    ASSERT exit_code equals 0
  END IF
END PROCEDURE
