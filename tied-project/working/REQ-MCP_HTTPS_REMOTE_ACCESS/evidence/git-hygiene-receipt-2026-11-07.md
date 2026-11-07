# Git hygiene receipt — REQ-MCP_HTTPS_REMOTE_ACCESS (post-close smoke)

- **Tool:** `tied_git_hygiene` [REQ-TIED_GIT_HYGIENE]
- **Mode:** `context_mode: plan_close_out`, `apply: false`
- **Date:** 2026-11-07

## Summary

Preview `ok: true`. Scoped commit for operator smoke fixes after close-out `49027f6a`.

**Staged (intended):** `server_info` output schema fix, compose/env example + host port publish, HTTP CLI ECONNREFUSED hints, manual-smoke + session-handoff, `.gitignore` for `.env`, `deploy/.env.example`.

**Excluded unrelated drift:** MCP fixture envelopes, corpus/source-graph indexes, `tied-bundle/reports/source-graph/`, other REQ working trees, stray `tied-project/citdp/CITDP-REQ-*` gate-test litter, `non-tied-plans/docker-official-skills-import/`, operator `.env` files (now gitignored).

**Gitignore close-out:** Added `.env`, `**/.env`, `!**/.env.example`.
