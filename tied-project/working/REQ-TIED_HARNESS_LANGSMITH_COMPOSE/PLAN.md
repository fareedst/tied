# PLAN — REQ-TIED_HARNESS_LANGSMITH_COMPOSE

**Resolved sponsor intent:** Optional **client-side** LangSmith trace **export** into local working-folder JSON paths for HTOL compose (`@harness-trace-review`, `@harness-trace-analyzer`). **Not** TIED core, **not** gate authority, **not** auto YAML/LEAP.

## Scope in vs out

| In | Out |
| --- | --- |
| Explicit `@harness-trace-langsmith-compose` skill + optional operator-run export script | LangSmith as TIED MCP tool or checklist gate input |
| HTOL guide + LangChain comparison cross-links (Phase 4 optional compose) | Harbor / Daytona adapters |
| `PROMPT_TYPE_LEAF_IDS` + prompt-type bundle inventory | Terminal Bench effectiveness claims |
| Compose handoff to existing harness skills | Substituting `tied_checklist_gate_validate` |

## Costly choices (accepted in-plan)

| Choice | Ladder | Disposition |
| --- | --- | --- |
| Optional export script (fleet egress, API keys client-owned) | Costly | **Do** — script is opt-in; keys never in repo |
| Third methodology harness leaf skill | Reversible | **Do** |
| Update HTOL “Fetch traces” row to optional compose path | Reversible | **Do** |

## Sponsor decisions (recorded)

| Date | Decision | Record |
| --- | --- | --- |
| 2026-10-21 | **No LangSmith keys** for live API smoke; proceed with no-network contract tests only | [sponsor-decisions-evidence.md](evidence/sponsor-decisions-evidence.md) |

## profile_depth

`minimal` — doc/skill/script slice; no integrated adversarial inquiry activation.

## Implementation slices

1. TIED stack (REQ/ARCH/IMPL + pseudo-code sidecar)
2. RED: skill contract test, export script unit test, HTOL doc markers
3. GREEN: skill, script, guide + comparison updates, enrollment constant
4. Verification gate + `tied_validate_consistency`
