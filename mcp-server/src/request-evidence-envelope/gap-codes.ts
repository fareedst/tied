/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * Corpus inventory string → envelope gap code mappings (plan §3.4).
 */

export const CORPUS_INVENTORY_TO_GAP_CODE: Record<string, string> = {
  sparse_tracker_execution_evidence_only_six_completed_slugs: "tracker_sparse",
  root_adversarial_inquiry_projection_parallel_to_phase_directories: "artifact_path_root_projection_rejected",
  evidence_provenance_missing_request_token_phase_run_id_command: "provenance_incomplete",
  gate_result_verdict_unresolved_status_warn: "finding_unresolved",
  finding_ledger_observed_lifecycle_unresolved_entries: "finding_unresolved",
  operator_evidence_status_not_run_with_completed_markers: "command_success_unproven",
  identical_hashes_across_phases_suggest_stale_copy_not_fresh_runs: "evidence_stale",
};

export const ENVELOPE_SPECIFIC_GAP_CODES = [
  "envelope_missing",
  "envelope_schema_invalid",
  "envelope_revision_conflict",
  "expected_artifact_missing",
  "not_applicable_receipt_missing",
  "legacy_json_in_json_wrapper",
  "dual_write_divergence",
  "legacy_inferred",
  "unknown_artifact_unclassified",
  "tracker_dual_write",
  "thin_ledger",
] as const;

/** Wave 5 process-adherence codes (default warn at minimal depth). */
export const PROCESS_ADHERENCE_GAP_CODE_SET = new Set<string>([
  "tracker_dual_write",
  "tracker_sparse",
  "expected_artifact_missing",
  "evidence_stale",
  "thin_ledger",
]);

export function mapCorpusInventoryString(inventory: string): string {
  return CORPUS_INVENTORY_TO_GAP_CODE[inventory] ?? "unknown_artifact_unclassified";
}
