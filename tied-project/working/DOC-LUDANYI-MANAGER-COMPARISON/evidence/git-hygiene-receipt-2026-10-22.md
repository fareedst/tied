# Git hygiene receipt — plan_close_out (preview)

**Date:** 2026-10-22  
**Context:** `close-out` for Wave 1–2 Ludanyi manager-method comparison (doc-only, `depth_tier: minimal`)  
**Tool:** `tied_git_hygiene` (`apply: false`, `context_mode: plan_close_out`)

## Scoped staging map (this close-out)

| Path | Action |
| --- | --- |
| `docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation.md` | track (new) |
| `docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md` | track (new) |
| `.gitignore` | allowlist **only** the two Ludanyi comparison paths (cursor/bkpdir drift excluded from this commit) |
| `CHANGELOG.md` | outreach entry |
| `tied-project/working/DOC-LUDANYI-MANAGER-COMPARISON/evidence/*` | close-out receipts |

## Workspace drift (not staged)

- 160+ tracked dirty paths and other untracked `docs/comparisons/*` / `docs/tools/*` — left untouched per scoped `traceable-commit`.

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

**Applied unstaged (scoped):** two `!docs/comparisons/andras-ludanyi-*.md` negations under the comparisons block; stage at `traceable-commit` with Ludanyi files only.
