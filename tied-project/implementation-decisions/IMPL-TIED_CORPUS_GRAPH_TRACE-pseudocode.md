# [IMPL-TIED_CORPUS_GRAPH_TRACE] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] — Trace token references in corpus graph.

Grammar-Version: v2

## Corpus token trace

- [IMPL-TIED_CORPUS_GRAPH_TRACE] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] Resolve node_id to detail_path and static references edges.
procedure TRACE_CORPUS_GRAPH_NODE:
  Contract:
    INPUT: CorpusGraphIndex, node_id, depth
    OUTPUT: CorpusGraphTraceView
    POST: success => references are token ids from references edges only
    EFFECTS: pure
  LOOKUP node by node_id
  COLLECT references edges up to depth
  RETURN trace view
