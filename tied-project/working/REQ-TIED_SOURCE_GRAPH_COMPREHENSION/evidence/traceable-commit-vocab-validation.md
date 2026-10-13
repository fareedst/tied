# Traceable commit — vocab validation (pre-commit)

**Request:** `REQ-TIED_SOURCE_GRAPH_COMPREHENSION`  
**Date:** 2026-10-13  
**Commit:** **`f5377751`** (2026-10-13)

## Vocab touchpoint 3 (VALIDATE)

| Name | Layer | Match |
| --- | --- | --- |
| source graph / code_graph | client vocab (matrix) | `source_type: code_graph` remains **observed** until sponsor matrix approval |
| structural comprehension | docs/comparisons | aligned to Trail/Graft comparison doc |
| tied_source_graph_* | MCP tool surface | matches PROC-TIED_SOURCE_GRAPH_COMPREHENSION |

No new client glossary file required for slice 1; terms recorded in CITDP + sponsor decisions evidence.

## Proposed commit scope (when sponsor commits)

- `mcp-server/src/source-graph/*`
- `mcp-server/src/tools/index.ts`
- `tied-project/requirements*` / ARCH / IMPL* / semantic-tokens
- `tied-project/working/REQ-TIED_SOURCE_GRAPH_COMPREHENSION/**`
