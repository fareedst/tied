# [IMPL-TIED_META_HUB_MCP] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]

procedure MCP_CITDP_RECONCILE_RUN:
  # [IMPL-TIED_META_HUB_MCP] [IMPL-TIED_CITDP_RECONCILE] [REQ-TIED_META_HUB_REPRESENTATION]
  Contract:
    INPUT: dry_run default true, report_path optional
    OUTPUT: JSON ledger plus optional YAML report file
    PRE: project_root resolves to store root
    POST: apply only when dry_run false and ledger clean
    EFFECTS: same as BUILD/APPLY reconcile modules
    TERMINATION: total
  CALL BUILD_RECONCILE_LEDGER
  IF report_path: WRITE yaml ledger
  IF NOT dry_run: CALL APPLY_RECONCILE_LEDGER

procedure MCP_CORPUS_MAP_BUILD:
  # [IMPL-TIED_META_HUB_MCP] [IMPL-TIED_CORPUS_MAP_BUILD] [REQ-TIED_META_HUB_REPRESENTATION]
  Contract:
    INPUT: out_path, hub_path
    OUTPUT: written markdown path and counts
    PRE: hub_path guard tied-project
    EFFECTS: write out_path only
    TERMINATION: total
  CALL BUILD_CORPUS_MAP and WRITE file
