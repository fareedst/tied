# PLAN — add-feature + add-refine-build

**REQ:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [REQ-PROMPT_TYPE_SUBAGENT]  
**Sponsor intent:** `/add-feature` replaces `/plan-new-feature`; `/add-refine-build` replaces `/plan-refine-build`. No backward-compat stubs; no historical working/demo doc sweep.

## Scope

| In | Out |
|---|---|
| `tools/bundled-prompt-type-skills/add-feature/` | `tied-project/working/**` archives |
| `.cursor/agents/add-feature.md`, `add-refine-build.md` | `docs/demos/**` |
| Bootstrap manifest, Jev taxonomy, e2e tests | Fixture ledger `source.kind` strings |
| TIED REQ/ARCH/IMPL + vocab + CITDP sequence | Mass CHANGELOG history edits |

## Acceptance

- 13-leaf bundle installs; frontmatter `name` matches directory
- Sequence test: **add-feature → refine-plan → build-plan**
- `@close-out` leaf unchanged

## Depth

`minimal` · advisory · tooling only
