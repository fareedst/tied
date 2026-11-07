# Traceable commit evidence — tied-methodology-release-4-2-0

**Date:** 2026-11-07

**Commit:** `6a3f8962` — `chore(release): TIED methodology 4.2.0`

## Tests

- `npm test --prefix mcp-server -- src/tied-methodology-version.test.ts src/server-info/server-info.test.ts src/store-readme-structure.test.ts` — exit 0
- `node scripts/conversation-adherence-score.test.mjs` — 9/9 pass

## install.json witness

After `./tied-install.sh --refresh .`:

```
jq -r .tied_version tied-bundle/install.json
4.2.0
```

File is install-managed (gitignored); documented here, not in commit SHA.
