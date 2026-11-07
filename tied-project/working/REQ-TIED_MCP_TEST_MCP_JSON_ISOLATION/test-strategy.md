# Test strategy — REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION

**Mode:** add-feature design only. **depth_tier:** minimal.

| ID | Layer | Intent |
| --- | --- | --- |
| T-GUARD-01 | unit | `bindWritableProjectCorpus` throws on store `tied-project` path |
| T-GUARD-02 | unit | Succeeds on `mkdtemp/.../tied-project` |
| T-MHR-01 | unit | `mcp-http-server.test.ts` passes with temp binding |
| T-SCAN-01 | composition | Repo scan: no `bindWritableProjectCorpus` on resolved store `tied-project` |

Verification: `npm test --prefix mcp-server` (or scoped files after build-plan).
