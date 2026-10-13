# [IMPL-TIED_SOURCE_GRAPH_REFRESH] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] — Refresh local source-graph index.

Grammar-Version: v2

## REFRESH_SOURCE_GRAPH_INDEX

- [IMPL-TIED_SOURCE_GRAPH_REFRESH] [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] Scan TS/JS files, build symbols/edges, persist source-graph-index.v1 JSON under .tied/source-graph/.
- Contract:
  - INPUT: repo_root, optional index_rel_path, optional glob
  - PRE: repo_root exists and is readable
  - OUTPUT: index object and index_path | error
  - POST: success => content_hash reflects sorted file contents; index schema_version is source-graph-index.v1
  - EFFECTS: IO (write index file only under repo_root/.tied)
  - FAILURE_MODES: SCOPE_EMPTY when no TS/JS files match

## CHECK_SOURCE_GRAPH_FRESHNESS

- [IMPL-TIED_SOURCE_GRAPH_REFRESH] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] Compare live tree hash to index.content_hash; advisory STALE_INDEX diagnostic when mismatch.
- Contract:
  - INPUT: repo_root, index
  - OUTPUT: ok boolean, live content_hash, diagnostics
  - EFFECTS: pure (read-only)
