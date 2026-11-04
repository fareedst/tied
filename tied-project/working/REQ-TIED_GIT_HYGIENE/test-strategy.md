# Test strategy — REQ-TIED_GIT_HYGIENE (test-all-hygiene)

| Layer | Command | Scope |
| --- | --- | --- |
| Composition | `node --test tools/bootstrap/build-commands-test-all-hygiene.test.mjs` | Alias, CLI guide mention, dry-run non-mutation |
| Unit (existing) | `cd mcp-server && npm test -- project-operations/git-hygiene.test.ts` | MCP preview/apply unchanged |
