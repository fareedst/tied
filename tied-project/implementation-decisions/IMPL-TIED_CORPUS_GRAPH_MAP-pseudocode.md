# [IMPL-TIED_CORPUS_GRAPH_MAP] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] — Map view over corpus graph index.

Grammar-Version: v2

## Corpus map clusters

- [IMPL-TIED_CORPUS_GRAPH_MAP] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] Aggregate nodes by index_file with edge counts.
procedure BUILD_CORPUS_GRAPH_MAP:
  Contract:
    INPUT: CorpusGraphIndex
    OUTPUT: CorpusGraphMapView
    EFFECTS: pure
  GROUP nodes BY index_file
  COUNT edges per index_file cluster
  RETURN clusters and totals
