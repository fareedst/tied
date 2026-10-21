# Git hygiene preview — plan_close_out — 2026-10-21

**REQ:** REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE  
**Tool:** `tied_git_hygiene` (`apply: false`, `context_mode: plan_close_out`)

## Scoped commit (this REQ only)

Stage only paths for CLI operator output texture; exclude unrelated workspace drift (comparisons, EDPC, source-graph, other working folders).

## Untracked in scope

- `scripts/_build_commands_cli_guide.inc.sh`
- `tools/bootstrap/build-commands-how.test.mjs`
- `tied-project/citdp/CITDP-REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE-pseudocode.md`
- `tied-project/working/REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE/` (PLAN, CITDP copy, gates scripts, committed evidence policy per sibling REQs)

## Gitignore hygiene

**N/A** for new patterns — regenerable envelope/receipt paths remain under existing `tied-project/working/**/evidence/` ignore rules; committed PLAN/CITDP/gate runners follow HTOL/LangChain precedent.
