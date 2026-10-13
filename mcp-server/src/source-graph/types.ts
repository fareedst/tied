/**
 * [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]
 */

export const INDEX_SCHEMA_VERSION = "source-graph-index.v1";
export const RECEIPT_SCHEMA_VERSION = "source-graph-receipt.v1";
export const VALIDATOR_VERSION = "1.0.0";
export const PROOF_BOUNDARY =
  "Static TypeScript/JavaScript analysis via compiler API; does not prove runtime behavior, dynamic dispatch, or non-TS languages.";

export type SourceGraphSymbol = {
  symbol_id: string;
  file: string;
  kind: "function" | "unknown";
  name: string;
  exported: boolean;
};

export type SourceGraphEdge = {
  from_symbol_id: string;
  to_symbol_id: string;
  kind: "calls" | "imports";
};

export type SourceGraphIndex = {
  schema_version: typeof INDEX_SCHEMA_VERSION;
  repo_root: string;
  content_hash: string;
  built_at: string;
  language_scope: ["typescript", "javascript"];
  symbols: SourceGraphSymbol[];
  edges: SourceGraphEdge[];
  files: string[];
};

export type SourceGraphDiagnostic = {
  code: "STALE_INDEX" | "MISSING_SYMBOL" | "INVALID_INDEX" | "SCOPE_EMPTY";
  message: string;
};

export type SourceGraphReceipt = {
  schema_version: typeof RECEIPT_SCHEMA_VERSION;
  ok: boolean;
  proof_boundary: string;
  validator_version: string;
  content_hash?: string;
  index_path?: string;
  diagnostics: SourceGraphDiagnostic[];
  map?: SourceGraphMapView;
  trace?: SourceGraphTraceView;
};

export type SourceGraphMapView = {
  clusters: Array<{
    directory: string;
    file_count: number;
    symbol_count: number;
    edge_count: number;
  }>;
  totals: { files: number; symbols: number; edges: number };
};

export type SourceGraphTraceView = {
  symbol_id: string;
  depth: number;
  callers: string[];
  callees: string[];
};
