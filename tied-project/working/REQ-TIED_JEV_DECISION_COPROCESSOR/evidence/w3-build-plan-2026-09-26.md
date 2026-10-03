# W3 build-plan evidence — 2026-09-26

## Delivered

- `mcp-server/src/jev/prompt-type-taxonomy.ts` — 13 leaf types + applicability enum
- `mcp-server/src/jev/prompt-type-heuristic.ts` — explicit-name scan (no ambiguous inference)
- `mcp-server/src/jev/prompt-type-advisory.ts` — `advisePromptTypes` + envelope hints
- `mcp-server/scripts/replay-jev-prompt-type-advisory.ts`
- Fixtures: `fixtures/prompt-type-advisory-prompts.jsonl`

## Contract

- **Does not** load or invoke prompt-type skills or `prompt-type-router`.
- **Suggested sequence** prefers explicit tokens in remainder; Jev is advisory when key present.
- **Tied applicability:** `full` | `client-local` | `minimal` per Prompt Composer boundary.

## Tests

```bash
cd mcp-server && bun test src/jev/
bun run scripts/replay-jev-prompt-type-advisory.ts
```

## Notes

- `non-tied-debug` remainder no longer also suggests bare `debug` (substring guard).
