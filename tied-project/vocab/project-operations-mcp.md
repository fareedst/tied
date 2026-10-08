# Project operations MCP

**Scope:** Client vocabulary for MCP project-operation tools, the `/xlate` skill (Touchpoint 1), and the sponsor `/unblock` skill (planned decisions blocking progress).

## Terms

| Term | Meaning |
|------|---------|
| `tied_project_lint` | Read-only MCP tool composing index validation, `tied_validate_consistency`, optional CITDP DAE sizing, optional pseudocode gate checks. |
| `tied_git_hygiene` | Preview-first git porcelain classifier; apply deletes **untracked** paths only when `allowed_paths` exactly matches the untracked set. |
| `tied_sponsor_questions` | Read-only costly-choice extractor using hinge validation, consequence ladder, and pending LEAP proposals. |
| `/xlate` | Explicit skill prefix for Touchpoint 1 RESOLVE; installed to `.cursor/skills/xlate`. |
| `xlate` skill | Bundled skill at `tools/bundled-xlate-skill/SKILL.md`; bootstrap install mirrors `tied-yaml`, not prompt-type bundle. |
| `/unblock` | Explicit skill prefix for sponsor decision sessions when **known or planned** costly choices block plan progress; prioritize answers that clear the most path toward completion. |
| `unblock` skill | Bundled skill at `tools/bundled-unblock-skill/SKILL.md`; `tied-install.sh` installs to `.cursor/skills/unblock` and `.claude/skills/unblock` (manifest `BUNDLED_STANDALONE_CLIENT_SKILLS`). |

## Boundaries

- Authoritative consistency remains **`tied_validate_consistency`**; lint composes diagnostics only.
- Checklist gate authority remains **`tied_checklist_gate_validate`** / **`tied_verify`**.
- Git hygiene does not commit, stage, or run destructive git commands beyond guarded untracked deletion.
