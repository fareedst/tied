# PLAN — Rename plan-close-out → close-out

**REQ:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS]  
**Sponsor intent:** `/close-out` replaces `/plan-close-out`; only `plan-new-feature` keeps the `plan-` prefix among skills that compete in autocomplete ordering.

## Scope

| In | Out |
|---|---|
| Canonical bundle `tools/bundled-prompt-type-skills/close-out/` | Historical `tied-project/working/**/plan-close-out-handoff.md` filenames |
| Bootstrap `manifest.json` `PROMPT_TYPE_SKILL_DIRS` | Ledger `source.kind: plan-close-out` in old gate JSON |
| `.cursor/agents/close-out.md` | Mass edit of archived docs under `docs/` |
| Jev taxonomy + e2e contract tests | Breaking alias stub `plan-close-out/` (would defeat autocomplete goal) |

## Acceptance

- `refine-plan`, `build-plan`, `plan-new-feature`, **`close-out`** install via `tied-install.sh`
- `mcp-server` prompt-type skill + subagent tests green
- Vocab [prompt-composer.md](../../vocab/prompt-composer.md) documents `@close-out`

## Depth

`minimal` · gate policy advisory · docs/tooling only
