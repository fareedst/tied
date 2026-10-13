# Git-hygiene receipt — plan-close-out (traceable-commit prep)

**Date:** 2026-10-13  
**Run-id:** `sgc-full-tree-closeout-git-hygiene-2026-10-13`  
**Tool:** `tied_git_hygiene` (`context_mode: plan_close_out`, preview only)

## Untracked (stage at traceable-commit)

| Path | Class | Action |
| --- | --- | --- |
| `mcp-server/test/fixtures/source-graph/mini-repo/tied-bundle/reports/source-graph/source-graph-index.v1.json` | **track** (fixture golden) | `git add` with fixture tree |

## Tracked intentional (stage)

- `mcp-server/src/source-graph/index-builder.ts`
- `mcp-server/test/fixtures/source-graph/mini-repo/.tied/...` **deletion** (git add -u)
- Project TIED + vocab + working evidence per `tied_git_hygiene` tracked_dirty list
- Hygiene pins: adversarial fixture envelopes (×2), checklist `1787603099` regression manifest, JEV benchmark, `envelope-gap-report.v1.yaml`

## Do not stage (gitignored regenerables)

- `tied-project/working/**/evidence/request-evidence-envelope.v1.json`
- `tied-project/working/**/evidence/closeout-run-close-out-gates.json` (local receipt; handoff cites path)
- Other paths matching `.gitignore` `tied-project/working/**/evidence/*` regenerable rules

## Gitignore close-out ([PROC-GITIGNORE_CLOSE_OUT])

**N/A** — no new ignore patterns; fixture index is **track**, not ephemeral.

## Outcome

Preview `ok: true`; no `.gitignore` edits; no untracked deletes.
