# build-plan verification — REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE

**date:** 2026-11-08

## Tests

```text
cd mcp-server/packages/agentstream && npm run build
npx tsx --test $(find src -name '*.test.ts' | tr '\n' ' ')
```

**Result:** 114 tests, 0 failures.

## Key new tests

- `src/cursor-stream.test.ts` — SC-CURSOR-SESSION-01
- `src/cursor-turn-retry.test.ts` — T-LIVE-SESSION-01, T-LIVE-SESSION-02
