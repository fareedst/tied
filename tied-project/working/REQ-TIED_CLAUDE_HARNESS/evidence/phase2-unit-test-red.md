# Phase 2 unit-test-red — SELECT_AGENT_HARNESS (2026-09-23)

**Pattern B minimal shim:** `mcp-server/packages/agentstream/src/harness-select.ts` (stub returns `cursor` only).

**RED tests:** `mcp-server/packages/agentstream/src/red/harness-select-phase2.test.ts`

**Command (expect failures until GREEN):**

```bash
cd mcp-server/packages/agentstream && npm run test:harness-red
```

**Deferred blocks:** `RUN_AGENTSTREAM_TURN`, live Claude subprocess — fixture gates in Phase 2 GREEN slice.
