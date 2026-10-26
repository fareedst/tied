# unit-test-green — REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE

```bash
node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs
node --test tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs
node --test tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs
cd mcp-server && npx tsx --test src/request-evidence-envelope/checker-backed-envelope-proof.test.ts
```

All green at close-out 2026-10-26.
