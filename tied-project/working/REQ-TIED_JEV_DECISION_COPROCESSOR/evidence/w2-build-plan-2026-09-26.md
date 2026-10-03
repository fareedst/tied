# W2 build-plan evidence — 2026-09-26

## Delivered

- `mcp-server/src/jev/routing-table.ts` — parse `tied/vocab/routing.md` table
- `mcp-server/src/jev/keyword-preload.ts` — keyword PRELOAD baseline (unchanged agent behavior)
- `mcp-server/src/jev/shadow-vocab-preload.ts` — shadow log + agreement helper
- `mcp-server/scripts/replay-jev-vocab-shadow.ts` — offline replay (CI-safe without `--live`)
- Fixtures: `fixtures/vocab-shadow-prompts.jsonl` (10 prompts)

## Tests

```bash
cd mcp-server && bun test src/jev/
bun run scripts/replay-jev-vocab-shadow.ts
# Live Jev comparison (optional):
JEV_API_KEY=... bun run scripts/replay-jev-vocab-shadow.ts --live
```

## Acceptance

- Offline replay: `agreement_rate: 1` (Jev skipped; keyword-only baseline).
- Live `--live` run must meet ≥90% agreement or document disagreements in a follow-up evidence note.

## Fix (W1→W2)

- `resolveJevConfig` honors explicit `apiKey: undefined` in tests (no accidental env key).
