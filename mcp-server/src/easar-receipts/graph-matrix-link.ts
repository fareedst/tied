/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * code_graph matrix row receipt linkage (freshness + trace ids).
 */

export const CODE_GRAPH_RECEIPT_SCHEMA = "code-graph-matrix-receipt.v1";

export type CodeGraphMatrixReceipt = {
  schema_version: typeof CODE_GRAPH_RECEIPT_SCHEMA;
  matrix_row_number: number;
  source_type: "code_graph";
  location: string;
  disposition: "observed" | "approved" | "unresolved" | "rejected";
  graph_freshness_run_id: string;
  graph_trace_id?: string;
  index_path?: string;
};

export type IntentElevationRowLike = {
  source_type: string;
  location: string;
  disposition: string;
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: row is code_graph; POST: receipt binds freshness run id.
export function buildCodeGraphMatrixReceipt(input: {
  matrix_row_number: number;
  row: IntentElevationRowLike;
  graph_freshness_run_id: string;
  graph_trace_id?: string;
  index_path?: string;
}): { ok: true; receipt: CodeGraphMatrixReceipt } | { ok: false; error: string } {
  if (input.row.source_type !== "code_graph") {
    return { ok: false, error: "row_not_code_graph" };
  }
  if (!input.graph_freshness_run_id.trim()) {
    return { ok: false, error: "missing_graph_freshness_run_id" };
  }
  const disposition = input.row.disposition as CodeGraphMatrixReceipt["disposition"];
  const allowed = new Set(["observed", "approved", "unresolved", "rejected"]);
  if (!allowed.has(disposition)) {
    return { ok: false, error: "invalid_disposition" };
  }
  return {
    ok: true,
    receipt: {
      schema_version: CODE_GRAPH_RECEIPT_SCHEMA,
      matrix_row_number: input.matrix_row_number,
      source_type: "code_graph",
      location: input.row.location,
      disposition,
      graph_freshness_run_id: input.graph_freshness_run_id.trim(),
      graph_trace_id: input.graph_trace_id?.trim() || undefined,
      index_path: input.index_path?.trim() || undefined,
    },
  };
}
