# [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] — MCP snapshot receipt from subject repo (read-only).

Grammar-Version: v2

## Project size snapshot

- [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Compose three layers and hashes; never mutate subject TIED YAML.
procedure BUILD_PROJECT_SIZE_SNAPSHOT:
  # [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Compose layers into receipt.
  Contract:
    INPUT: repo_root, optional include_trial_factors
    OUTPUT: project-size-snapshot-receipt.v1
    PRE: repo_root resolves to directory
    POST:
      - on success: receipt includes proof_boundary, layers, hashes, cross_layer
    EFFECTS: IO (read-only scan)
    FAILURE_MODES: MISSING_TIED_PROJECT
  CALL COLLECT_ATOMS_LAYER
  CALL COLLECT_OPERATIONAL_INTENT_LAYER
  CALL COLLECT_PROOF_FACETS_LAYER
  CALL DERIVE_CROSS_LAYER_RATIOS
  IF include_trial_factors THEN CALL READ_TRIAL_FACTOR_ANNEX
  RETURN receipt with static proof_boundary

procedure COLLECT_OPERATIONAL_INTENT_LAYER:
  # [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS] Hash and aggregate pseudo-code mass.
  Contract:
    INPUT: merged IMPL *-pseudocode.md bodies under subject tied-project
    OUTPUT: operational_intent metrics and operational_intent_hash
    POST: hash recomputed every snapshot from merged normalized bodies
    EFFECTS: pure (after read)
  MERGE sidecar bodies in sorted path order
  SET operational_intent_hash FROM sha256(merged)
  SUM gross_lines, template_overlap_lines, procedure_count, parse_node_count
  SET applied_lines TO gross_lines minus template_overlap_lines
