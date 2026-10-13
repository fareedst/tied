# [IMPL-TIED_SOURCE_GRAPH_TRAVERSE] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] — Symbol trace.

Grammar-Version: v2

## TRACE_SOURCE_GRAPH_SYMBOL

- [IMPL-TIED_SOURCE_GRAPH_TRAVERSE] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] Return caller and callee symbol_ids for calls edges at bounded depth.
- Contract:
  - INPUT: index, symbol_id, depth
  - OUTPUT: SourceGraphTraceView
  - POST: unknown symbol_id => empty callers/callees
  - EFFECTS: pure
