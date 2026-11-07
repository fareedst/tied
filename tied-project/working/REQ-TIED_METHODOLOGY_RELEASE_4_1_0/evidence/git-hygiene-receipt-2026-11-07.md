# Git hygiene receipt — plan_close_out

**request_token:** REQ-TIED_METHODOLOGY_RELEASE_4_1_0 · **date:** 2026-11-07 · **apply:** false

MCP `tied_git_hygiene` preview: `ok: true`. Scoped commit excludes unrelated tracked dirty paths (other REQs, regenerable fixtures, gate receipts).

**install.json witness:** `tied-bundle/install.json` `tied_version: "4.1.0"` on disk after refresh; path under `tied-bundle/` install-managed gitignore — **not staged** (operators verify via `jq .tied_version tied-bundle/install.json`).

**Regenerable (not staged):** `request-evidence-envelope.v1.json`, `not-applicable-receipt.v1.json` per `.gitignore`.
