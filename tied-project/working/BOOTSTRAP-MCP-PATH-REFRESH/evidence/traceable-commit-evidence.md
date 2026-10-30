# Traceable commit — BOOTSTRAP-MCP-PATH-REFRESH (follow-up)

## Scope

Follow-up to `c45ee53e` (MCP path refresh on install): E2E + operator doc lint.

## Tests

- `node --import tsx --test mcp-server/src/e2e/bootstrap-and-load.test.ts` — 5/5 pass
- `node --import tsx --test mcp-server/src/e2e/prompt-type-skills.test.ts` — 7/7 pass
- `node tools/bootstrap/lint-stale-layout.mjs .` — 0 findings

## Git hygiene

- Preview: MCP `tied_git_hygiene` `plan_close_out`, `apply: false` — ok (2026-10-29)
- **Excluded** from staging: 80+ unrelated tracked dirty paths and untracked program/working trees (see hygiene preview `tracked_dirty` / `untracked`)

## Upstream feedback capture

N/A — operator-driven test/doc alignment; no client feedback ingest.

## Completion signals (ad-hoc)

- **Machine close-out:** not_run — no REQ token / envelope / tracker for this pass
- **Process contract:** partial — tests + lint run; no CITDP tracker
- **Adherence ledger:** not_run
- **Workspace cleanliness:** pass for scoped staging map; unrelated repo drift remains unstaged

## Commit

**Commit skipped** — sponsor did not request `git commit` in this thread. Use `evidence/proposed-commit-message.txt` when ready.
