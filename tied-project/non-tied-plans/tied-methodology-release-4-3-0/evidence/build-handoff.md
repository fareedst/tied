# Build handoff — tied-methodology-release-4-3-0

**date:** 2026-11-18  
**prompt_type:** `@non-tied-build`

## Witness

| Check | Result |
|-------|--------|
| `VERSION` | `4.3.0` |
| `jq .store_methodology_version tied-bundle/install.json` | `4.3.0` |
| `npm test` (methodology battery) | pass |
| `conversation-adherence-score.test.mjs` | pass (9/9) |
| Frozen readouts @ 4.2.2 | unchanged (RDB) |

## Commit

**`7fee91c3`** — `chore(release): TIED methodology 4.3.0` (see [close-out-handoff.md](./close-out-handoff.md)).