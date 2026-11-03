# [IMPL-TIED_STORE_README_SECTIONS] [ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING] [REQ-TIED_STORE_README_EXPERIENCE_HUB]
# How: Structure test and manual doctor replay enforce README band contracts and hub index links.

PROCEDURE VERIFY_README_STRUCTURE
  # [IMPL-TIED_STORE_README_SECTIONS] [ARCH-TIED_STORE_README_INFORMATION_ARCHITECTURE] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING] [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE]
  # PRE: Repo root README.md exists.
  # POST: Three normative H2 bands present in order (Quick start, Explore TIED, Install and use);
  #       required links including docs/tied-experience/index.md; Quick start H3 delivery spine;
  #       build-workspace + tied-install help substrings; no forbidden certification claims.
  #       [REQ-TIED_STORE_README_EXPERIENCE_HUB] extends POST via hub describe block.
  INPUT repo_root_abs
  CONTROL run_structure_test
  EFFECTS none on runtime
  FAILURE_MODES missing_band; missing_link; forbidden_claim; missing_hub_lens_link

  IF run_structure_test THEN
    # [IMPL-TIED_STORE_README_SECTIONS] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]
    # How: node --import tsx --test mcp-server/src/store-readme-structure.test.ts
    INVOKE node --import tsx --test AT mcp-server/src/store-readme-structure.test.ts
    ASSERT exit_code equals 0
  END IF
END PROCEDURE

PROCEDURE VERIFY_EXPERIENCE_HUB_INDEX
  # [IMPL-TIED_STORE_README_SECTIONS] [REQ-TIED_STORE_README_EXPERIENCE_HUB]
  # PRE: docs/tied-experience/index.md exists under repo_root_abs.
  # POST: Index links to sponsor, operator, engineer-agent, facilitator lenses and both appendices.
  INPUT repo_root_abs
  CONTROL run_structure_test
  EFFECTS none on runtime
  FAILURE_MODES missing_hub_file; missing_lens_link

  IF run_structure_test THEN
    # How: same test file; describe block TIED experience hub structure
    INVOKE node --import tsx --test AT mcp-server/src/store-readme-structure.test.ts
    ASSERT exit_code equals 0
  END IF
END PROCEDURE
