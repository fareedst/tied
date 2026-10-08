# build-plan — REQ-TIED_CLIENT_BOOTSTRAP_SKILLS

**Date:** 2026-10-08

## Implementation (retroactive record)

- `tools/bootstrap/lib/client-skills-catalog.mjs` — manifest loader + install helpers
- `tools/bootstrap/manifest.json` — `BUNDLED_STANDALONE_CLIENT_SKILLS`
- Bootstrap wiring in `skills.mjs`, `bootstrap.mjs`, `layers/skills-linked.mjs`, `layers/store.mjs`
- `mcp-server/src/e2e/client-bootstrap-skills.test.ts`
- TIED stack REQ/ARCH/IMPL + pseudocode sidecars

## Tests

- `client-skills-catalog.test.mjs`: 4/4 pass
- `client-bootstrap-skills.test.ts`: pass (npm test filter)
