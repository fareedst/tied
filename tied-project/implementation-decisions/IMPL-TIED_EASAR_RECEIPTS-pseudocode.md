# [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY] — EASAR Mode C receipt builders

Grammar-Version: v2

## Inventory receipt

procedure BUILD_INVENTORY_V1_FROM_WALK:
  # [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
  # How: Normalize scoped analysis walk into inventory.v1 with stable content_hash.
  Contract:
    INPUT: walk_summary
    OUTPUT: inventory_v1
    PRE: walk_summary includes request_token, baseline_revision, scoped_analysis_run_id, files list
    POST: inventory.v1 content_hash stable over body fields excluding content_hash
    EFFECTS: infer languages; sort entry_points and roots_used
    TERMINATION: total
  CALL inferLanguages(files)
  CALL stableHash(bodyWithoutHash)
  RETURN inventory_v1

## Engagement facet

procedure VALIDATE_EASAR_ENGAGEMENT_FACET:
  # [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY]
  # How: Reject easar_full when brownfield mode is not pilot or strict.
  Contract:
    INPUT: tracker_brownfield_section
    OUTPUT: ok_diagnostics
    PRE: tracker may include brownfield_intent_elevation.engagement
    POST: when engagement is easar_full, mode is pilot or strict
    EFFECTS: pure
    FAILURE_MODES: invalid_brownfield_engagement; easar_full_requires_pilot_or_strict_mode
    TERMINATION: total
  IF engagement IS easar_full AND mode NOT IN (pilot, strict) THEN
    RETURN { error: easar_full_requires_pilot_or_strict_mode }
  RETURN ok_diagnostics

## Graph matrix receipt

procedure BUILD_CODE_GRAPH_MATRIX_RECEIPT:
  # [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
  # How: Bind matrix code_graph row to graph freshness run id.
  Contract:
    INPUT: matrix_row, graph_freshness_run_id
    OUTPUT: receipt_or_error
    PRE: row.source_type is code_graph; graph_freshness_run_id non-empty
    POST: code-graph-matrix-receipt.v1 binds matrix_row_number to freshness and optional trace id
    EFFECTS: pure
    TERMINATION: total
  RETURN receipt_or_error

procedure BUILD_EASAR_CODE_GRAPH_RECEIPT_MCP:
  # [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]
  # How: MCP wrapper calling source graph freshness then matrix receipt builder.
  Contract:
    INPUT: request_token, matrix_row_number, row, repo_root
    OUTPUT: receipt_result
    PRE: row is code_graph
    POST: receipt JSON written when output_path set
    EFFECTS: IO; read-only source graph freshness
    FAILURE_MODES: freshness_failed; row_not_code_graph; missing_graph_freshness_run_id
    TERMINATION: total
  CALL tiedSourceGraphFreshness
  CALL buildCodeGraphMatrixReceipt
  RETURN receipt_result

## Claim matrix map

procedure BUILD_CLAIM_MATRIX_MAP:
  # [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
  # How: Normalize claim.id to matrix row number pairs.
  Contract:
    INPUT: entries
    OUTPUT: map_or_error
    PRE: entries list claim_id and matrix_row_number pairs
    POST: sorted unique claim_id and unique matrix_row_number
    EFFECTS: pure
    FAILURE_MODES: duplicate_claim_id; duplicate_matrix_row
    TERMINATION: total
  RETURN map_or_error

procedure BUILD_EASAR_CLAIM_MATRIX_MAP_MCP:
  # [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
  # How: MCP wrapper writing claim-matrix-map.v1 under working evidence.
  Contract:
    INPUT: request_token, entries
    OUTPUT: map_result
    PRE: optional output_path
    POST: buildClaimMatrixMap then write claim-matrix-map.v1 when output_path set
    EFFECTS: IO; envelope patch same discipline as inventory MCP
    FAILURE_MODES: duplicate_claim_id; duplicate_matrix_row; empty_entries
    TERMINATION: total
  CALL buildClaimMatrixMap
  RETURN map_result

## Reflexion report

procedure BUILD_REFLEXION_REPORT_V1:
  # [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
  # How: Export-only reflexion synthesis from inquiry obligation metadata.
  Contract:
    INPUT: inquiry_run_id, obligation_report_ref, gate_allowed
    OUTPUT: reflexion_report_v1
    PRE: inquiry_run_id and obligation_report_ref present
    POST: reflexion-report.v1 with export_only true
    EFFECTS: pure; adversarial_ledger_ref is pointer only
    TERMINATION: total
  RETURN reflexion_report_v1

procedure BUILD_EASAR_REFLEXION_REPORT_MCP:
  # [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
  # How: MCP wrapper writing reflexion-report.v1 under working evidence.
  Contract:
    INPUT: request_token, inquiry_run_id, gate_allowed, obligation_report_ref
    OUTPUT: reflexion_result
    PRE: optional divergences and adversarial_ledger_ref
    POST: buildReflexionReportV1; write reflexion-report.v1 when output_path set
    EFFECTS: IO; no finding-ledger body merged into divergences
    FAILURE_MODES: missing_obligation_report_ref; missing_inquiry_run_id
    TERMINATION: total
  CALL buildReflexionReportV1
  RETURN reflexion_result
