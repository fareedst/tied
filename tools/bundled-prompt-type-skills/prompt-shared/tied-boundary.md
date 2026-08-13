# TIED applicability boundary

TIED tracking applies **only** when the caller explicitly selects a TIED workflow prompt type:

- `plan-new-feature`
- `refine-plan`
- `build-plan`
- `plan-close-out`
- `debug`
- `use-skill`
- `ammend-commit`
- `leap-ad-hoc`
- `leap-diff-promote`

## Rules

1. **Do not infer** TIED applicability by inspecting whether a `tied/` directory exists.
2. **Do not** auto-start CITDP, Tracker copies, IMPL updates, or verification gates unless the active prompt type requires them.
3. When a TIED leaf is active, follow the full TIED/CITDP/LEAP stack per linked shared references.
4. `git-condition:` is **informational context only** — never triggers automatic repository inspection.

## Forbidden (all skills)

- `pbpaste` / `pbcopy`
- Automatic `git` stage, commit, amend, or push
- Unapproved repository inspection
