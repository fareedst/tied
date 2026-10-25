# Refine-plan pass 1 — REQ-TIED_CLI_MCP_JSON_BASE_PATH

**Date:** 2026-10-25  
**Prompt type:** refine-plan  
**Linked plan:** `gf-16_mcp.json_base_path_15f178d8.plan.md`  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Delta vs initial Cursor plan

| Area | Initial plan | Refine pass 1 |
| --- | --- | --- |
| Artifacts | Cursor plan only | Working **PLAN + CITDP + Tracker** in `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/` |
| Algorithm | Bullet list | **Mermaid flowchart** + module names (`mcp-base-path.mjs`, `resolve-tied-cli-env.mjs`) |
| Bundle env | Not specified | Read **`TIED_METHODOLOGY_BUNDLE_PATH`** from mcp when set |
| Feedback | Implement step 0 | **Deferred to build-plan** (refine skill boundary) |
| Gate | Mentioned | **`pre_implementation` allowed: true** — [`pre_implementation-2026-10-25T14-42-12-822Z.json`](../gates/pre_implementation-2026-10-25T14-42-12-822Z.json) |

## Sponsor constraints recorded

- No shell env requirement for client quick-start.
- mcp.json canonical; fail closed if missing.
- Store-only implementation scope.

## Next step

`@build-plan` on this PLAN — ingest feedback, mint REQ/ARCH/IMPL, TDD, close-out.
