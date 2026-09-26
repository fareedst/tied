# W0+W1 build-plan evidence — 2026-09-26

**Wave:** W0 (vocab + coordinator doc) + W1 (jev HTTP client)

## Delivered

- `tied/vocab/decision-copilot.md` + routing row `5g`
- `docs/comparisons/jev-for-tied-improvement.md`
- REQ/ARCH/IMPL tokens + semantic-tokens registry
- `mcp-server/src/jev/*` + `jev.test.ts` (mocked fetch)

## Tests

```bash
cd mcp-server && bun test src/jev/jev.test.ts
```

## Not in this slice

- MCP tool registration for Jev (future wave)
- W2 shadow routing, W3–W5 harness hooks
- close_out envelope / verification gate (deferred)
