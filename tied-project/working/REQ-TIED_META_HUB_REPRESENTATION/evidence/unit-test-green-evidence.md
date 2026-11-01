# unit-test-green evidence

Scoped green (2026-11-01):

```bash
cd mcp-server && npm test -- src/meta-hub-representation/citdp-reconcile.test.ts src/meta-hub-representation/corpus-map-build.test.ts src/tools/meta-hub-representation-mcp.test.ts
```

Full `npm test` may fail on unrelated `leap-proposal-mcp.test.ts` flake; MHR slice tests pass.
