# Git hygiene preview — workspace sweep (post close-out)

**Date:** 2026-10-20  
**Context:** `plan_close_out` · `apply: false`

## Scope

Sponsor invoked `@plan-close-out` to commit remaining dirty paths unless noise.

## Restored (noise / out-of-wave drift)

Per [git-hygiene-receipt-2026-10-20-kaizen.md](./git-hygiene-receipt-2026-10-20-kaizen.md) and [gitignore-close-out-hygiene.md](./gitignore-close-out-hygiene.md):

- Adversarial fixture envelope timestamp/revision churn
- Source-graph index refresh side effects (store + mini-repo fixture)
- Process-certification YAML key reorder (styling-only; unchanged content hashes)
- EDPC example template key reorder
- Unrelated REQ working evidence (benchmark re-run, regression manifest, plan-close-out tracker drift)

Command: `git restore` on 14 paths (see session handoff).

## Staged for commit (in-wave fix)

- `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/evidence/git-hygiene-receipt-2026-10-19.md` — correct full commit SHA for legacy layout decommission trace (`28fee75a3ea33ca7a75f4097dd17a93c1dbe69bf`).

## Untracked

None at sweep time (`tied_git_hygiene` preview).
