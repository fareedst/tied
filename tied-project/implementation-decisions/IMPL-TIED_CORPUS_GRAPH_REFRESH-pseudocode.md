# [IMPL-TIED_CORPUS_GRAPH_REFRESH] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] — Build regenerable corpus graph index from tied-project YAML corpus.

Grammar-Version: v2

## Corpus index refresh

- [IMPL-TIED_CORPUS_GRAPH_REFRESH] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] Scan project index YAML and detail files; emit corpus-graph-index.v1 under tied-bundle/reports/corpus-graph/.
- Contract:
  - INPUT: repo_root, optional index_rel_path, optional tied_project_rel (default tied-project)
  - PRE: repo_root exists; tied_project_rel directory exists or SCOPE_EMPTY diagnostic
  - OUTPUT: CorpusGraphIndex | error INVALID_INDEX
  - POST:
    - success => index written only under reports path; nodes include index tokens with detail_file edges
    - error => no index write
  - FAILURE_MODES: SCOPE_EMPTY, INVALID_INDEX
  - EFFECTS: IO
  - TERMINATION: total
procedure REFRESH_CORPUS_GRAPH_INDEX:
  # [IMPL-TIED_CORPUS_GRAPH_REFRESH] [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION] Walk four index files and detail YAML/Markdown sidecars.
  Contract:
    INPUT: repo_root, tied_project_rel
    PRE: paths readable
    OUTPUT: CorpusGraphIndex
    POST: success => content_hash covers all scanned file bytes
    EFFECTS: IO
  DATA: index_files = requirements, architecture-decisions, implementation-decisions, semantic-tokens
  FOR EACH index_file IN index_files:
    PARSE top-level token keys into nodes (kind from prefix)
    RESOLVE detail_file relative to tied-project when present
    IF detail missing THEN EMIT diagnostic MISSING_DETAIL
  FOR EACH scanned text file:
    EXTRACT token references via bracket pattern and yaml list token strings
    ADD edges kind references between owning node and referenced token
  COMPUTE content_hash from concatenated file contents
  WRITE JSON index to tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json
  RETURN index
