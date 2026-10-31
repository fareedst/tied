/**
 * [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION]
 */

export const INDEX_SCHEMA_VERSION = "corpus-graph-index.v1";
export const RECEIPT_SCHEMA_VERSION = "corpus-graph-receipt.v1";
export const VALIDATOR_VERSION = "1.0.0";
export const PROOF_BOUNDARY =
  "Static scan of tied-project YAML and Markdown sidecars; does not prove REQ satisfaction, test passage, or semantic correctness of token references.";

export type CorpusGraphNodeKind = "req" | "arch" | "impl" | "proc" | "other";

export type CorpusGraphNode = {
  node_id: string;
  kind: CorpusGraphNodeKind;
  index_file: string;
  detail_path?: string;
};

export type CorpusGraphEdge = {
  from_node_id: string;
  to_node_id: string;
  kind: "detail_file" | "references";
};

export type CorpusGraphIndex = {
  schema_version: typeof INDEX_SCHEMA_VERSION;
  repo_root: string;
  tied_project_rel: string;
  content_hash: string;
  built_at: string;
  nodes: CorpusGraphNode[];
  edges: CorpusGraphEdge[];
  files: string[];
};

export type CorpusGraphDiagnostic = {
  code: "STALE_INDEX" | "MISSING_NODE" | "INVALID_INDEX" | "SCOPE_EMPTY" | "MISSING_DETAIL";
  message: string;
};

export type CorpusGraphMapView = {
  clusters: Array<{
    index_file: string;
    node_count: number;
    edge_count: number;
  }>;
  totals: { nodes: number; edges: number; files: number };
};

export type CorpusGraphTraceView = {
  node_id: string;
  depth: number;
  detail_path?: string;
  references: string[];
};

export type CorpusGraphReceipt = {
  schema_version: typeof RECEIPT_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: string;
  validator_version: string;
  content_hash?: string;
  index_path?: string;
  diagnostics: CorpusGraphDiagnostic[];
  map?: CorpusGraphMapView;
  trace?: CorpusGraphTraceView;
};
