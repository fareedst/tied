/**
 * [IMPL-TIED_CORPUS_GRAPH_REFRESH] [REQ-TIED_CORPUS_COMPREHENSION]
 */

import {
  buildCorpusGraphMap,
  checkCorpusGraphFreshness,
  refreshCorpusGraphIndex,
  traceCorpusGraphNode,
} from "./index-builder.js";
import {
  PROOF_BOUNDARY,
  RECEIPT_SCHEMA_VERSION,
  VALIDATOR_VERSION,
  type CorpusGraphReceipt,
} from "./types.js";

export async function tiedCorpusGraphRefresh(args: {
  repo_root: string;
  index_rel_path?: string;
  tied_project_rel?: string;
}): Promise<CorpusGraphReceipt> {
  const { index, index_path, diagnostics } = await refreshCorpusGraphIndex(args);
  if (!index_path) {
    return {
      schema_version: RECEIPT_SCHEMA_VERSION,
      ok: false,
      proof_boundary: PROOF_BOUNDARY,
      validator_version: VALIDATOR_VERSION,
      diagnostics,
    };
  }
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: diagnostics.every((d) => d.code !== "SCOPE_EMPTY"),
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics,
    map: buildCorpusGraphMap(index),
  };
}

export async function tiedCorpusGraphMap(args: {
  repo_root: string;
  index_rel_path?: string;
  tied_project_rel?: string;
}): Promise<CorpusGraphReceipt> {
  const { index, index_path, diagnostics } = await refreshCorpusGraphIndex(args);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: Boolean(index_path),
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics,
    map: buildCorpusGraphMap(index),
  };
}

export async function tiedCorpusGraphTrace(args: {
  repo_root: string;
  node_id: string;
  depth?: number;
  index_rel_path?: string;
  tied_project_rel?: string;
}): Promise<CorpusGraphReceipt> {
  const { index, index_path, diagnostics } = await refreshCorpusGraphIndex({
    repo_root: args.repo_root,
    index_rel_path: args.index_rel_path,
    tied_project_rel: args.tied_project_rel,
  });
  const trace = traceCorpusGraphNode(index, args.node_id, args.depth ?? 1);
  const ok = index.nodes.some((n) => n.node_id === args.node_id);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: index.content_hash,
    index_path,
    diagnostics: ok
      ? diagnostics
      : [...diagnostics, { code: "MISSING_NODE", message: `Unknown token ${args.node_id}` }],
    trace,
  };
}

export async function tiedCorpusGraphFreshness(args: {
  repo_root: string;
  index_rel_path?: string;
  tied_project_rel?: string;
}): Promise<CorpusGraphReceipt> {
  const { index, index_path } = await refreshCorpusGraphIndex(args);
  const fresh = await checkCorpusGraphFreshness({ repo_root: args.repo_root, index });
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: fresh.ok,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    content_hash: fresh.content_hash,
    index_path,
    diagnostics: fresh.diagnostics,
  };
}
