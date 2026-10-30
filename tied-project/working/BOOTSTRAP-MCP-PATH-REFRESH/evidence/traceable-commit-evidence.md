# Traceable commit — BOOTSTRAP-MCP-PATH-REFRESH

## Scope

Non-tied-plan bootstrap change (session: MCP json path refresh on tied-install).

## Tests

- `node --test tools/bootstrap/lib/mcp-config.test.mjs tools/bootstrap/lib/layers/mcp-layer.test.mjs` — 13/13 pass

## Git hygiene

- Preview: MCP `tied_git_hygiene` `plan_close_out`, `apply: false` — ok
- Unrelated tracked dirty and untracked paths **excluded** from staging (see git status at close-out)

## Upstream feedback capture

N/A — operator-driven bootstrap fix; no client feedback ingest.

## Completion signals (ad-hoc)

- **Machine close-out:** not_run — no REQ token / envelope / tracker for this pass
- **Process contract:** partial — tests run; no CITDP tracker
- **Adherence ledger:** not_run
- **Workspace cleanliness:** pass for scoped staging map only; unrelated repo drift documented in hygiene preview
