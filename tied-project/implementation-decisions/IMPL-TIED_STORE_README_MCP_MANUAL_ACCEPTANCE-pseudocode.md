# [IMPL-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE] [ARCH-TIED_STORE_README_MCP_ONBOARDING] [REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE]
# How: README anchor and structure-test substrings enforce manual Cursor and Claude MCP accept flows.

PROCEDURE DOCUMENT_README_MCP_ACCEPTANCE
  # [IMPL-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE] [ARCH-TIED_STORE_README_MCP_ONBOARDING] [REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE] [REQ-TIED_CLAUDE_HARNESS] [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE]
  # PRE: README.md exists at repo root; store-readme-structure.test.ts lists locked MCP manual substrings.
  # POST: README §2 contains manual-mcp-acceptance anchor, Cursor Customize steps, Claude TUI block; agent mcp enable under Advanced.
  #       operator-lens.md step 4 links to README#manual-mcp-acceptance.
  # EFFECTS: none on runtime
  # FAILURE_MODES: missing_anchor; missing_substring; structure_test_fail
  INPUT repo_root_abs
  CONTROL apply_readme_edits

  IF apply_readme_edits THEN
    # [IMPL-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE] [REQ-TIED_STORE_README_MCP_MANUAL_ACCEPTANCE]
    # How: edit README Band 3 H4 and quick-start step 4 anchor; edit operator-lens step 4.
    ENSURE README CONTAINS id manual-mcp-acceptance
    ENSURE README CONTAINS Customize AND MCPs AND tied-yaml-optin
    ENSURE README CONTAINS "2 new MCP servers found" AND "Enable selected"
    INVOKE node --import tsx --test AT mcp-server/src/store-readme-structure.test.ts
    ASSERT exit_code equals 0
  END IF
END PROCEDURE
