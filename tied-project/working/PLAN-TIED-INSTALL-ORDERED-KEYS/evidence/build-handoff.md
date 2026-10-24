# Build handoff — PLAN-TIED-INSTALL-ORDERED-KEYS

**Date:** 2026-10-23

## Delivered

- [`tools/bootstrap/lib/migrate-ordered-list-keys.mjs`](../../../tools/bootstrap/lib/migrate-ordered-list-keys.mjs) — shared migration + post-apply audit spawn
- [`tools/bootstrap/install-layers.mjs`](../../../tools/bootstrap/install-layers.mjs) — `--migrate-ordered-list-keys`, `--fail-if-pending`
- [`scripts/rename-citdp-command-keys.mjs`](../../../scripts/rename-citdp-command-keys.mjs) — thin wrapper over lib (store maintenance roots)
- Tests: `migrate-ordered-list-keys.test.mjs`, `install-layers-migrate-ordered.test.mjs`
- Docs: `tied-install-help.mjs`, `tools/bootstrap/README.md`

## Verification

- `node --test tools/bootstrap/lib/migrate-ordered-list-keys.test.mjs tools/bootstrap/install-layers-migrate-ordered.test.mjs` — pass
- `node scripts/rename-citdp-command-keys.mjs --check --include-trackers` — exit 0
- `./tied-install.sh --migrate-ordered-list-keys --fail-if-pending .` — exit 0

Close-out deferred; no commit unless sponsor asks.
