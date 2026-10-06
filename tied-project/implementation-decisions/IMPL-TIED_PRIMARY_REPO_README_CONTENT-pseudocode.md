# [IMPL-TIED_PRIMARY_REPO_README_CONTENT] [ARCH-TIED_PRIMARY_REPO_README_STRUCTURE] [REQ-TIED_PRIMARY_REPO_ONBOARDING]
# How: Doc-only verification replays operator commands from README against this repo layout.

PROCEDURE VERIFY_DOC_COMMANDS
  # [IMPL-TIED_PRIMARY_REPO_README_CONTENT] [ARCH-TIED_PRIMARY_REPO_README_STRUCTURE] [REQ-TIED_PRIMARY_REPO_ONBOARDING]
  # PRE: TIED store built (mcp-server/dist exists); primary repo has tied-project or legacy tied layout.
  # POST: Doctor reports ok; tied_config_get_base_path resolves project traceability root.
  INPUT store_root_abs
  INPUT primary_repo_root_abs
  CONTROL run_doctor
  CONTROL confirm_mcp_base_path
  EFFECTS none on product runtime
  FAILURE_MODES doctor_nonzero; base_path_mismatch

  IF run_doctor THEN
    # [IMPL-TIED_PRIMARY_REPO_README_CONTENT] [REQ-TIED_PRIMARY_REPO_ONBOARDING]
    # How: node tools/bootstrap/install-layers.mjs --doctor primary_repo_root_abs
    INVOKE node tools/bootstrap/install-layers.mjs --doctor AT primary_repo_root_abs
  END IF

  IF confirm_mcp_base_path THEN
    # [IMPL-TIED_PRIMARY_REPO_README_CONTENT] [REQ-TIED_PRIMARY_REPO_ONBOARDING]
    # How: MCP tied_config_get_base_path equals resolveTiedLayout(primary).tiedDir
    INVOKE tied_config_get_base_path
    ASSERT result.base_path equals tied_project_or_legacy_dir
  END IF
END PROCEDURE
