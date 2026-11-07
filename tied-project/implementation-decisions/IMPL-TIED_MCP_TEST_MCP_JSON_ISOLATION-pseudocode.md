# IMPL-TIED_MCP_TEST_MCP_JSON_ISOLATION

<!-- [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION] [ARCH-TIED_MCP_TEST_MCP_JSON_ISOLATION] -->

```
ASSERT_SAFE_MCP_JSON_WRITE_TARGET(projectRoot)
  PRE: about to write .cursor/mcp.json
  IF TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE=1 THEN RETURN
  IF projectRoot under os.tmpdir() THEN RETURN
  IF .tied/store.yaml exists under projectRoot THEN THROW TEST_FIXTURE refuse
  POST: writeInstallMcpJson may proceed
```
