# [IMPL-TIED_EDPC_META_HUB_METHODOLOGY] [ARCH-TIED_EDPC_META_HUB_ENGAGEMENT] [REQ-TIED_EDPC_META_HUB_ENGAGEMENT] — normative meta-hub EDPC methodology surface

Grammar-Version: v2

## Methodology surface (template + guide)

procedure MAINTAIN_META_HUB_METHODOLOGY_SURFACE:
  # [IMPL-TIED_EDPC_META_HUB_METHODOLOGY] [ARCH-TIED_EDPC_META_HUB_ENGAGEMENT] [REQ-TIED_EDPC_META_HUB_ENGAGEMENT]
  # How: Ship and guard tied-bundle charter template and edpc-meta-hub-engagement.md; no MCP schema change required for normative promote.
  Contract:
    INPUT: tied_bundle_root
    OUTPUT: methodology_artifacts_present
    PRE: tied_bundle_root contains templates/ and docs/
    POST: template declares engagement_pattern meta_hub, hub_path tied-project/, bounded_path includes tied-project; guide links PROC-EDPC_COMPREHENSION and working-artifact-placement
    EFFECTS: read-only verification via contract test
    FAILURE_MODES: missing_template; missing_guide; invalid_template_shape; missing_edpc_main_pointer
    TERMINATION: total
  ASSERT file_exists(tied_bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml)
  ASSERT file_exists(tied_bundle/docs/edpc-meta-hub-engagement.md)
  ASSERT file_contains(edpc_main_doc, "edpc-meta-hub-engagement.md")
  RETURN methodology_artifacts_present

procedure CONTRACT_TEST_META_HUB_TEMPLATE:
  # [IMPL-TIED_EDPC_META_HUB_METHODOLOGY] [REQ-TIED_EDPC_META_HUB_ENGAGEMENT]
  # How: npm test meta-hub-template asserts template YAML fields and doc pointers (normative guard after citdp-promote).
  Contract:
    INPUT: repo_root
    OUTPUT: test_pass
    PRE: mcp-server/src/edpc/meta-hub-template.test.ts present
    POST: test_pass is true
    EFFECTS: none on project YAML
    TERMINATION: total
  RUN npm test --prefix mcp-server -- meta-hub-template
  RETURN test_pass
