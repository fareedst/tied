# verification-gate — REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION

**Date:** 2026-10-19

| Command | Evidence |
| --- | --- |
| `node tools/bootstrap/lint-stale-layout.mjs` | [lint-stale-layout.stdout.txt](./lint-stale-layout.stdout.txt) |
| `node --test tools/bootstrap/lib/lint-stale-layout.test.mjs` | [lint-stale-layout-test.stdout.txt](./lint-stale-layout-test.stdout.txt) |
| `cd mcp-server && npx tsx --test src/store-readme-structure.test.ts` | [store-readme-structure-test.stdout.txt](./store-readme-structure-test.stdout.txt) |
| `node tools/bootstrap/lib/render-install-resource-matrix.mjs` | [install-resource-matrix-verify.stdout.txt](./install-resource-matrix-verify.stdout.txt) |

**Note:** `tied_validate_consistency` reports pre-existing repo-wide traceability gaps; this REQ is documentation-only. See [tied-validate-consistency.stdout.txt](./tied-validate-consistency.stdout.txt).
