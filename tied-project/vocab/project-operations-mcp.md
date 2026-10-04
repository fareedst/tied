# Project operations MCP

**Scope:** Client vocabulary for MCP project-operation tools and the `/xlate` skill (Touchpoint 1).

## Terms

| Term | Meaning |
|------|---------|
| `tied_project_lint` | Read-only MCP tool composing index validation, `tied_validate_consistency`, optional CITDP DAE sizing, optional pseudocode gate checks. |
| `tied_git_hygiene` | Preview-first git porcelain classifier; apply deletes **untracked** paths only when `allowed_paths` exactly matches the untracked set. |
| `tied_sponsor_questions` | Read-only costly-choice extractor using hinge validation, consequence ladder, and pending LEAP proposals. |
| `/xlate` | Explicit skill prefix for Touchpoint 1 RESOLVE; installed to `.cursor/skills/xlate`. |
| `xlate` skill | Bundled skill at `tools/bundled-xlate-skill/SKILL.md`; bootstrap install mirrors `tied-yaml`, not prompt-type bundle. |

## Boundaries

- Authoritative consistency remains **`tied_validate_consistency`**; lint composes diagnostics only.
- Checklist gate authority remains **`tied_checklist_gate_validate`** / **`tied_verify`**.
- Git hygiene does not commit, stage, or run destructive git commands beyond guarded untracked deletion.
