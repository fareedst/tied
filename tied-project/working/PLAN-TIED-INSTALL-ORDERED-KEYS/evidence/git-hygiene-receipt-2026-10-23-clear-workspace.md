# Git hygiene receipt — @clear-workspace PLAN-TIED-INSTALL-ORDERED-KEYS

**Date:** 2026-10-23  
**Scope:** `PLAN-TIED-INSTALL-ORDERED-KEYS` (residual ordered-key / YAML canonicalization churn after product commit `b5613d15`)  
**Tool:** `tied_git_hygiene` (`apply: false`, `context_mode: plan_close_out`)  
**MCP base path:** `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project`

## Routing steps

| Step | Result |
| --- | --- |
| 1. Scope | `tied-project/working/PLAN-TIED-INSTALL-ORDERED-KEYS/` — follow-on hygiene, not a new product slice |
| 2. `tied_project_lint` | **Skipped (advisory)** — bulk revert; no project YAML writes |
| 3. Close-out gap | **N/A** — plan slice already committed `b5613d15`; machine envelope not chartered for this token |
| 4. Git hygiene | **Applied: revert accidental tracked churn** (140 paths restored to `HEAD`) |
| 5. Gitignore hygiene | **N/A** — `.gitignore` restored with tracked tree |
| 6. Commit-ready | **No** — intentional WIP retained (see below) |
| 7. Traceable-commit | **Deferred** — sponsor did not request commit in this pass |
| 8. Handoff | **N/A** — workspace materially cleaner |

## Pre-pass posture

- **142 tracked dirty** paths (YAML key order/quotes, regenerable JSON, working trackers, `.gitignore` comparison allowlist experiment).
- **233** total dirty entries including untracked (MCP preview ~89 untracked).

## Action taken

- `git restore` on **140** tracked paths (all dirty except bootstrap vocab-link checker).
- **Retained (bucket D):** `tools/bootstrap/lib/check-docs-vocab-links.mjs`, `check-docs-vocab-links.test.mjs` — fence-aware link scan; separate program if committed.
- **Re-applied legitimate migrations:** `node scripts/rename-citdp-command-keys.mjs --include-trackers .` — **16** working CITDP copies under `tied-project/working/**` (`commands` → `command_seq` only; the bulk of the 140-path diff was YAML key-order noise).
- **Verification:** `node scripts/rename-citdp-command-keys.mjs --check --include-trackers .` → exit **0**.

## Post-pass posture

- **18 tracked modified** — 16 CITDP working copies + vocab-link checker pair; receipt file untracked until sponsor commits.
- **~89 untracked** — comparison docs, gate trackers, ontology wave stubs, operator `.bkpdir.yml`; no sponsor delete allowlist applied.

## Related

- Product commit: `b5613d15` — [close-out-handoff.md](./close-out-handoff.md)
- Prior repo-wide preview: [CLEAR-WORKSPACE-2026-10-23/evidence/git-hygiene-receipt-2026-10-23.md](../../CLEAR-WORKSPACE-2026-10-23/evidence/git-hygiene-receipt-2026-10-23.md)
- **PLAN-DATA-FILE-ORDERING:** complete — do not re-run `@close-out` unless envelope invalidated ([session-handoff.md](../../PLAN-DATA-FILE-ORDERING/evidence/session-handoff.md))

## Sponsor next steps

1. **`git push origin main`** when ready (42+ local commits unpushed).
2. **`@clear-workspace <REQ>`** per untracked program (e.g. `DOC-HEIMSBBAKK-ONTOLOGY-COMPARISON`, `REQ-TIED_OPEN_ONTOLOGIES_WAVE3`) or supply delete allowlist for regenerable gate trackers.
3. **`@build-plan`** for new work under **REQ-TIED_YAML_CANONICALIZATION** or another REQ — not slice 3 of DATA-FILE-ORDERING without re-charter.
