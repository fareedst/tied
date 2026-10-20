# Git hygiene receipt — prompt-type naming close-out

**Date:** 2026-10-19  
**Context:** `plan_close_out` (preview only, `apply: false`)  
**REQ:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [REQ-PROMPT_TYPE_SUBAGENT]

## Preview summary

- **Untracked (committed with wave):** `tied-project/working/REQ-PROMPT_TYPE_ADD_FEATURE_RENAME/`, `tied-project/working/REQ-PROMPT_TYPE_CLOSE_OUT_RENAME/` (PLAN + close-out evidence only).
- **Excluded from staging:** regenerable fixture envelopes, source-graph index, JEV benchmark JSON, unrelated NTIC handoff SHA line, install-corrupted `.gitignore` (reverted).
- **Linked install:** `.cursor/skills/` refreshed; stale `plan-close-out` / `plan-new-feature` stubs removed locally (gitignored).

## Skill picker smoke

| Skill | `.cursor/skills` stub `name` | Canonical bundle |
|-------|------------------------------|------------------|
| `/add-feature` | `add-feature` | `tools/bundled-prompt-type-skills/add-feature/` |
| `/close-out` | `close-out` | `tools/bundled-prompt-type-skills/close-out/` |

**Note:** On the TIED **store** repo, `./tied-install.sh --refresh .` refreshes skill stubs but may exit non-zero when copying methodology docs (store is not a typical client). Do not run linked refresh against `.` if it would rewrite tracked `tied-bundle/` content; use client targets or `--mode full` for offline clients.
