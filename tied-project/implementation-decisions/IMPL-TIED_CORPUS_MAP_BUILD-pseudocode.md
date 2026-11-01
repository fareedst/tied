# [IMPL-TIED_CORPUS_MAP_BUILD] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]

procedure BUILD_CORPUS_MAP:
  # [IMPL-TIED_CORPUS_MAP_BUILD] [REQ-TIED_META_HUB_REPRESENTATION]
  Contract:
    INPUT: project_root, hub_path, optional baseline_revision
    OUTPUT: markdown with Layers, Scale, Authority rules sections
    PRE: hub_path includes tied-project
    POST: counts derived from filesystem walk
    EFFECTS: read-only
    TERMINATION: total
  COLLECT counts for working, citdp, vocab, detail dirs
  EMIT markdown per edpc-meta-hub-engagement section template
