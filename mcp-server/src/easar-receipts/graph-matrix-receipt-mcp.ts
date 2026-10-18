/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: build code-graph-matrix-receipt.v1 from source-graph freshness + matrix row.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { tiedSourceGraphFreshness } from "../source-graph/mcp-handlers.js";
import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import {
  CODE_GRAPH_RECEIPT_SCHEMA,
  buildCodeGraphMatrixReceipt,
  type CodeGraphMatrixReceipt,
  type IntentElevationRowLike,
} from "./graph-matrix-link.js";

export type BuildEasarCodeGraphMatrixReceiptInput = {
  request_token: string;
  matrix_row_number: number;
  row: IntentElevationRowLike;
  repo_root?: string;
  project_root?: string;
  index_rel_path?: string;
  graph_freshness_run_id?: string;
  graph_trace_id?: string;
  output_path?: string;
};

export type BuildEasarCodeGraphMatrixReceiptResult = {
  ok: true;
  schema_version: typeof CODE_GRAPH_RECEIPT_SCHEMA;
  graph_freshness_run_id: string;
  receipt: CodeGraphMatrixReceipt;
  source_graph_ok: boolean;
  source_graph_content_hash?: string;
  written_path?: string;
};

function defaultFreshnessRunId(freshnessPayload: {
  content_hash?: string;
  index_path?: string;
  ok: boolean;
}): string {
  const canonical = JSON.stringify({
    content_hash: freshnessPayload.content_hash ?? "",
    index_path: freshnessPayload.index_path ?? "",
    ok: freshnessPayload.ok,
  });
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex").slice(0, 16);
  return `easar-sg-freshness-${digest}`;
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: code_graph row; POST: receipt binds freshness correlation id + index_path.
export async function buildEasarCodeGraphMatrixReceipt(
  input: BuildEasarCodeGraphMatrixReceiptInput,
): Promise<BuildEasarCodeGraphMatrixReceiptResult> {
  const projectRoot = path.resolve(input.project_root ?? getClientProjectRoot());
  const repoRoot = path.resolve(input.repo_root ?? projectRoot);
  const freshness = await tiedSourceGraphFreshness({
    repo_root: repoRoot,
    index_rel_path: input.index_rel_path,
  });
  if (!freshness.index_path) {
    throw new Error("freshness_missing_index_path");
  }
  const indexPathRel = path.isAbsolute(freshness.index_path)
    ? path.relative(repoRoot, freshness.index_path).split(path.sep).join("/")
    : freshness.index_path.replace(/\\/g, "/");

  const graphFreshnessRunId =
    input.graph_freshness_run_id?.trim() || defaultFreshnessRunId(freshness);

  const built = buildCodeGraphMatrixReceipt({
    matrix_row_number: input.matrix_row_number,
    row: input.row,
    graph_freshness_run_id: graphFreshnessRunId,
    graph_trace_id: input.graph_trace_id,
    index_path: indexPathRel,
  });
  if (!built.ok) {
    throw new Error(built.error);
  }

  let written_path: string | undefined;
  if (input.output_path?.trim()) {
    const relative = input.output_path.replace(/\\/g, "/");
    const absolute = path.isAbsolute(relative)
      ? relative
      : path.join(projectRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    const body = {
      ...built.receipt,
      source_graph_content_hash: freshness.content_hash,
      source_graph_ok: freshness.ok,
      source_graph_diagnostics: freshness.diagnostics,
    };
    fs.writeFileSync(absolute, `${JSON.stringify(body, null, 2)}\n`, "utf8");
    written_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "verification",
      schema_version: CODE_GRAPH_RECEIPT_SCHEMA,
      proof_boundaries: ["read-only-tied-yaml", "static-graph-limits"],
    });
  }

  return {
    ok: true,
    schema_version: CODE_GRAPH_RECEIPT_SCHEMA,
    graph_freshness_run_id: graphFreshnessRunId,
    receipt: built.receipt,
    source_graph_ok: freshness.ok,
    source_graph_content_hash: freshness.content_hash,
    written_path,
  };
}
