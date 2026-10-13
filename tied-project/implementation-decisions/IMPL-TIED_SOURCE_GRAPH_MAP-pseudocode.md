# [IMPL-TIED_SOURCE_GRAPH_MAP] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] — Map clusters from index.

Grammar-Version: v2

## BUILD_SOURCE_GRAPH_MAP

- [IMPL-TIED_SOURCE_GRAPH_MAP] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] Aggregate per-directory file, symbol, and edge counts from a loaded index.
- Contract:
  - INPUT: SourceGraphIndex
  - OUTPUT: SourceGraphMapView with clusters and totals
  - EFFECTS: pure
