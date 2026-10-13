/**
 * [IMPL-TIED_SOURCE_GRAPH_REFRESH] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]
 */

import {
  buildSourceGraphMap,
  checkSourceGraphFreshness,
  loadSourceGraphIndex,
  refreshSourceGraphIndex,
  traceSourceGraphSymbol,
} from "./index-builder.js";
import {
  PROOF_BOUNDARY,
  RECEIPT_SCHEMA_VERSION,
  VALIDATOR_VERSION,
  type SourceGraphReceipt,
} from "./types.js";

export async function tiedSourceGraphRefresh(args: {
  repo_root: string;
  index_rel_path?: string;
}): Promise<SourceGraphReceipt> {
  const { index, index_path } = await refreshSourceGraphIndex(args);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: true,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics: [],
    map: buildSourceGraphMap(index),
  };
}

export async function tiedSourceGraphMap(args: {
  repo_root: string;
  index_rel_path?: string;
}): Promise<SourceGraphReceipt> {
  const { index_path } = await refreshSourceGraphIndex(args);
  const index = await loadSourceGraphIndex(index_path);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: true,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics: [],
    map: buildSourceGraphMap(index),
  };
}

export async function tiedSourceGraphTrace(args: {
  repo_root: string;
  symbol_id: string;
  depth?: number;
  index_rel_path?: string;
}): Promise<SourceGraphReceipt> {
  const { index_path } = await refreshSourceGraphIndex({
    repo_root: args.repo_root,
    index_rel_path: args.index_rel_path,
  });
  const index = await loadSourceGraphIndex(index_path);
  const trace = traceSourceGraphSymbol(index, args.symbol_id, args.depth ?? 1);
  const ok = trace.callers.length > 0 || trace.callees.length > 0 || index.symbols.some((s) => s.symbol_id === args.symbol_id);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics: ok
      ? []
      : [{ code: "MISSING_SYMBOL", message: `Unknown symbol ${args.symbol_id}` }],
    trace,
  };
}

export async function tiedSourceGraphFreshness(args: {
  repo_root: string;
  index_rel_path?: string;
}): Promise<SourceGraphReceipt> {
  const { index, index_path } = await refreshSourceGraphIndex(args);
  const fresh = await checkSourceGraphFreshness({ repo_root: args.repo_root, index });
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: fresh.ok,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: fresh.content_hash,
    index_path,
    diagnostics: fresh.diagnostics.map((d) => ({
      code: d.code as "STALE_INDEX",
      message: d.message,
    })),
  };
}
