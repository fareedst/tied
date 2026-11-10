/**
 * [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS]
 */

export const RECEIPT_SCHEMA_VERSION = "project-size-snapshot-receipt.v1";
export const VALIDATOR_VERSION = "1.0.0";
export const COHORT_ROW_SCHEMA_VERSION = "wf-trial-cohort-run.v1";

export const PROOF_BOUNDARY =
  "Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.";

export type ProjectSizeAtomsLayer = {
  vocab_preferred_terms: number;
  index_req: number;
  index_arch: number;
  index_impl: number;
  corpus_graph_nodes: number;
  corpus_graph_edges: number;
};

export type ProjectSizeOperationalIntentLayer = {
  sidecar_count: number;
  gross_lines: number;
  template_overlap_lines: number;
  applied_lines: number;
  procedure_count: number;
  parse_node_count: number;
};

export type ProjectSizeProofFacetsLayer = {
  unit_tests: number;
  composition_tests: number;
  e2e_tests: number;
  binding_inventory_tests: number;
  verify_evidence_files: number;
};

export type ProjectSizeCrossLayer = {
  operational_intent_per_atom: number | null;
  proof_facets_per_atom: number | null;
  tests_per_procedure: number | null;
};

export type ProjectSizeHashes = {
  operational_intent_hash: string;
  corpus_graph_content_hash?: string;
};

export type TrialFactorsAnnex = {
  implementation_stack_id?: string;
  orchestrator_exit_code?: number;
};

export type ProjectSizeSnapshotReceipt = {
  schema_version: typeof RECEIPT_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: typeof PROOF_BOUNDARY;
  validator_version: typeof VALIDATOR_VERSION;
  repo_root: string;
  layers: {
    atoms: ProjectSizeAtomsLayer;
    operational_intent: ProjectSizeOperationalIntentLayer;
    proof_facets: ProjectSizeProofFacetsLayer;
  };
  cross_layer: ProjectSizeCrossLayer;
  hashes: ProjectSizeHashes;
  trial_factors?: TrialFactorsAnnex;
  diagnostics: Array<{ code: string; message: string }>;
};
