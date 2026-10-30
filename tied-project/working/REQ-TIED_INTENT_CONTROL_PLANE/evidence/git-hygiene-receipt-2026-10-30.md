# Git hygiene receipt — 2026-10-30

**Scope:** Post–Wave 1 `@clear-workspace` (ad-hoc hygiene; Wave 1 close-out already complete).  
**MCP:** `tied_git_hygiene` preview (`context_mode: plan_close_out`, `apply: false`, `request_token: REQ-TIED_INTENT_CONTROL_PLANE`).

## Env label hygiene

| Check | Result |
| --- | --- |
| `.cursor/mcp.json` | `TIED_CLIENT_PROJECT_PATH` → `.../stdd/tied-project`; legacy keys stripped per install policy |
| Effective `base_path` | `tied-project/` (canonical env wins over shell `TIED_BASE_PATH=.../tied`) |
| Code | `tied_config_get_base_path` exposes `project_path_resolved_from` and `legacy_project_path_env_ignored` |

**Operator note:** Unset or align shell `TIED_BASE_PATH` to `tied-project/` when running CLI outside Cursor; IDE MCP should use mcp.json canonical paths.

## Staged at traceable-commit (this pass)

- `.gitignore` — ignore local Kirk methodology note
- Intent control plane handoff + anonymized reference docs under `docs/`
- Regenerated fixture/evidence: adversarial inquiry envelopes, source-graph index, checklist gate regression manifest, JEV context-pruning benchmark

## Excluded (regenerable / local)

- `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/evidence/evidence-chain-profile.v1.json` (gitignore)
- `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/evidence/request-evidence-envelope.v1.json` (gitignore)
- `.cursor/mcp.json` (install-managed, gitignored)

## Apply-delete

None (`apply: false`; no sponsor allowlist).
