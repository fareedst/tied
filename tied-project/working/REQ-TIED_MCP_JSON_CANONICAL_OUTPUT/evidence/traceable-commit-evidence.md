# Traceable commit — REQ-TIED_MCP_JSON_CANONICAL_OUTPUT

**Commit:** `b1ec7611`  
**Message:** feat(bootstrap): canonical mcp.json key order on refresh

**Close-out gate:** `close-out-mcp-json-canonical-20261029-r3` — `merged_decision.allowed: true`, envelope `blocking_gap_count: 0`.

**Tests:** `node --test tools/bootstrap/lib/mcp-json-canonical.test.mjs tools/bootstrap/lib/tied-path-env.test.mjs tools/bootstrap/lib/mcp-config.test.mjs` (20 pass).

**Co-staged:** REQ-TIED_CLIENT_PATH_ENV_MIGRATION (shared `mcp-config.mjs`, `tied-path-env`, MCP server dual-read).

**Excluded from commit:** unrelated dirty trackers, `.gitignore`, tied-bundle doc deletes, source-graph indexes.
