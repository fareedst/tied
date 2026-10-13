# Traceable commit — vocab validation (pre-commit)

**Request:** `REQ-TIED_SOURCE_GRAPH_COMPREHENSION`  
**Date:** 2026-10-13  
**Commit (slice 1):** **`5a47378f`** · **Commit (index path LEAP):** **`fd55b4d6`** (2026-10-13)

## Vocab touchpoint 3 (VALIDATE) — index path LEAP pass

| Name | Layer | Match |
| --- | --- | --- |
| regenerable index | ARCH option + IMPL | `tied-bundle/reports/source-graph/` (not `.tied/`) |
| source graph / code_graph | client vocab (matrix) | row 4 path updated; **observed** only |
| tied_source_graph_* | MCP tool surface | unchanged tool names |

No new glossary file; matrix + CITDP + PLAN aligned.

## Proposed commit scope (when sponsor commits)

- `mcp-server/src/source-graph/*`
- `mcp-server/src/tools/index.ts`
- `tied-project/requirements*` / ARCH / IMPL* / semantic-tokens
- `tied-project/working/REQ-TIED_SOURCE_GRAPH_COMPREHENSION/**`
