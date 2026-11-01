# [IMPL-TIED_CITDP_RECONCILE] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]

procedure BUILD_RECONCILE_LEDGER:
  # [IMPL-TIED_CITDP_RECONCILE] [REQ-TIED_META_HUB_REPRESENTATION]
  Contract:
    INPUT: project_root, optional working_paths, dry_run, force_dispositions
    OUTPUT: citdp-reconcile-ledger.v1
    PRE: TIED_BASE_PATH is tied-project/
    POST: each DOC-STDD divergent row classified
    EFFECTS: read-only when dry_run
    FAILURE_MODES: structural_conflict without force_disposition blocks apply
    TERMINATION: total
  LOAD divergent paths from dedupe log or input list
  FOR each working path: CLASSIFY_PAIR vs citdp basename
  RETURN ledger with unresolved_conflicts count

procedure APPLY_RECONCILE_LEDGER:
  # [IMPL-TIED_CITDP_RECONCILE] [REQ-TIED_META_HUB_REPRESENTATION]
  Contract:
    INPUT: ledger with dry_run false and unresolved_conflicts zero
    OUTPUT: applied row count
    PRE: ledger validated
    POST: citdp updated via writeCitdpRecord; working drafts removed per action
    EFFECTS: writes tied-project/citdp/ only
    TERMINATION: total
  IF dry_run OR unresolved_conflicts: FAIL CLOSED
  FOR each row: persist or delete per action map
