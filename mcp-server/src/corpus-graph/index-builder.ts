/**
 * [IMPL-TIED_CORPUS_GRAPH_REFRESH] [IMPL-TIED_CORPUS_GRAPH_MAP] [IMPL-TIED_CORPUS_GRAPH_TRACE]
 * [ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL] [REQ-TIED_CORPUS_COMPREHENSION]
 */

import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";
import yaml from "js-yaml";

import { prettyCanonicalJson } from "../storage-dump.js";
import {
  INDEX_SCHEMA_VERSION,
  PROOF_BOUNDARY,
  type CorpusGraphDiagnostic,
  type CorpusGraphEdge,
  type CorpusGraphIndex,
  type CorpusGraphMapView,
  type CorpusGraphNode,
  type CorpusGraphNodeKind,
  type CorpusGraphTraceView,
} from "./types.js";

const DEFAULT_INDEX_REL = "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json";
const DEFAULT_TIED_PROJECT_REL = "tied-project";

const INDEX_BASENAMES = [
  "requirements.yaml",
  "architecture-decisions.yaml",
  "implementation-decisions.yaml",
  "semantic-tokens.yaml",
] as const;

const TOKEN_KEY = /^(REQ|ARCH|IMPL|PROC)-[A-Z0-9_]+$/;
const BRACKET_TOKEN = /\[(REQ|ARCH|IMPL|PROC)-[A-Z0-9_]+\]/g;
const BARE_TOKEN = /\b(REQ|ARCH|IMPL|PROC)-[A-Z0-9_]+\b/g;

function hashContent(parts: string[]): string {
  return createHash("sha256").update(parts.join("\0")).digest("hex");
}

function kindFromToken(token: string): CorpusGraphNodeKind {
  if (token.startsWith("REQ-")) return "req";
  if (token.startsWith("ARCH-")) return "arch";
  if (token.startsWith("IMPL-")) return "impl";
  if (token.startsWith("PROC-")) return "proc";
  return "other";
}

function extractTokensFromText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(BRACKET_TOKEN)) {
    found.add(match[0].slice(1, -1));
  }
  for (const match of text.matchAll(BARE_TOKEN)) {
    found.add(match[0]);
  }
  return [...found];
}

function detailPathFromRecord(record: unknown): string | undefined {
  if (!record || typeof record !== "object") return undefined;
  const df = (record as Record<string, unknown>).detail_file;
  if (typeof df !== "string" || df === "null" || df.trim() === "") return undefined;
  return df.replace(/^\.\//, "");
}

async function scanCorpusProject(input: {
  repo_root: string;
  tied_project_rel: string;
}): Promise<{
  nodes: CorpusGraphNode[];
  edges: CorpusGraphEdge[];
  files: string[];
  content_hash: string;
  diagnostics: CorpusGraphDiagnostic[];
}> {
  const repoRoot = path.resolve(input.repo_root);
  const tiedRel = input.tied_project_rel;
  const tiedRoot = path.join(repoRoot, tiedRel);
  const diagnostics: CorpusGraphDiagnostic[] = [];

  try {
    await access(tiedRoot);
  } catch {
    diagnostics.push({ code: "SCOPE_EMPTY", message: `Missing tied-project directory: ${tiedRel}` });
  }

  const nodes: CorpusGraphNode[] = [];
  const edges: CorpusGraphEdge[] = [];
  const filesScanned = new Set<string>();
  const contentParts: string[] = [];

  for (const basename of INDEX_BASENAMES) {
    const relIndex = path.posix.join(tiedRel, basename);
    const absIndex = path.join(repoRoot, relIndex);
    try {
      await access(absIndex);
    } catch {
      continue;
    }
    const raw = await readFile(absIndex, "utf8");
    contentParts.push(raw);
    filesScanned.add(relIndex);

    let parsed: Record<string, unknown>;
    try {
      parsed = (yaml.load(raw) ?? {}) as Record<string, unknown>;
    } catch {
      diagnostics.push({ code: "INVALID_INDEX", message: `Failed to parse ${relIndex}` });
      continue;
    }

    for (const key of Object.keys(parsed).sort()) {
      if (!TOKEN_KEY.test(key)) continue;
      const record = parsed[key];
      const detailRel = detailPathFromRecord(record);
      const detailPath = detailRel ? path.posix.join(tiedRel, detailRel) : undefined;

      nodes.push({
        node_id: key,
        kind: kindFromToken(key),
        index_file: relIndex,
        detail_path: detailPath,
      });

      if (detailPath) {
        edges.push({ from_node_id: key, to_node_id: detailPath, kind: "detail_file" });
        const absDetail = path.join(repoRoot, detailPath);
        try {
          await access(absDetail);
          const detailText = await readFile(absDetail, "utf8");
          contentParts.push(detailText);
          filesScanned.add(detailPath);
          for (const ref of extractTokensFromText(detailText)) {
            if (ref === key) continue;
            edges.push({ from_node_id: key, to_node_id: ref, kind: "references" });
          }
        } catch {
          diagnostics.push({
            code: "MISSING_DETAIL",
            message: `detail_file not found for ${key}: ${detailPath}`,
          });
        }
      }
    }
  }

  const sidecarPattern = path.posix.join(tiedRel, "implementation-decisions", "*-pseudocode.md");
  const sidecars = await fg(sidecarPattern.replace(/\\/g, "/"), {
    cwd: repoRoot,
    onlyFiles: true,
  });
  for (const rel of sidecars.sort()) {
    const normalized = rel.replace(/\\/g, "/");
    const text = await readFile(path.join(repoRoot, normalized), "utf8");
    contentParts.push(text);
    filesScanned.add(normalized);
    const implMatch = path.basename(normalized).match(/^(IMPL-[A-Z0-9_]+)-pseudocode\.md$/);
    const owner = implMatch?.[1];
    for (const ref of extractTokensFromText(text)) {
      if (owner) {
        edges.push({ from_node_id: owner, to_node_id: ref, kind: "references" });
      }
    }
  }

  return {
    nodes: dedupeNodes(nodes),
    edges: dedupeEdges(edges),
    files: [...filesScanned].sort(),
    content_hash: hashContent(contentParts),
    diagnostics,
  };
}

export async function refreshCorpusGraphIndex(input: {
  repo_root: string;
  index_rel_path?: string;
  tied_project_rel?: string;
}): Promise<{ index: CorpusGraphIndex; index_path: string; diagnostics: CorpusGraphDiagnostic[] }> {
  const repoRoot = path.resolve(input.repo_root);
  const tiedRel = input.tied_project_rel ?? DEFAULT_TIED_PROJECT_REL;
  const scanned = await scanCorpusProject({ repo_root: repoRoot, tied_project_rel: tiedRel });

  if (scanned.nodes.length === 0 && scanned.diagnostics.some((d) => d.code === "SCOPE_EMPTY")) {
    const emptyIndex: CorpusGraphIndex = {
      schema_version: INDEX_SCHEMA_VERSION,
      repo_root: repoRoot,
      tied_project_rel: tiedRel,
      content_hash: scanned.content_hash,
      built_at: new Date().toISOString(),
      nodes: [],
      edges: [],
      files: [],
    };
    return { index: emptyIndex, index_path: "", diagnostics: scanned.diagnostics };
  }

  const index: CorpusGraphIndex = {
    schema_version: INDEX_SCHEMA_VERSION,
    repo_root: repoRoot,
    tied_project_rel: tiedRel,
    content_hash: scanned.content_hash,
    built_at: new Date().toISOString(),
    nodes: scanned.nodes,
    edges: scanned.edges,
    files: scanned.files,
  };

  const indexRel = input.index_rel_path ?? DEFAULT_INDEX_REL;
  const indexPath = path.join(repoRoot, indexRel);
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, `${prettyCanonicalJson(index)}\n`, "utf8");

  return { index, index_path: indexPath, diagnostics: scanned.diagnostics };
}

function dedupeNodes(nodes: CorpusGraphNode[]): CorpusGraphNode[] {
  const byId = new Map<string, CorpusGraphNode>();
  for (const n of nodes) byId.set(n.node_id, n);
  return [...byId.values()].sort((a, b) => a.node_id.localeCompare(b.node_id));
}

function dedupeEdges(edges: CorpusGraphEdge[]): CorpusGraphEdge[] {
  const seen = new Set<string>();
  const out: CorpusGraphEdge[] = [];
  for (const e of edges) {
    const key = `${e.from_node_id}|${e.to_node_id}|${e.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.sort((a, b) =>
    `${a.from_node_id}${a.to_node_id}`.localeCompare(`${b.from_node_id}${b.to_node_id}`),
  );
}

export async function loadCorpusGraphIndex(indexPath: string): Promise<CorpusGraphIndex> {
  const raw = await readFile(indexPath, "utf8");
  const parsed = JSON.parse(raw) as CorpusGraphIndex;
  if (parsed.schema_version !== INDEX_SCHEMA_VERSION) {
    throw new Error(`INVALID_INDEX: expected ${INDEX_SCHEMA_VERSION}`);
  }
  return parsed;
}

export function buildCorpusGraphMap(index: CorpusGraphIndex): CorpusGraphMapView {
  const clusters = new Map<string, { node_count: number; edge_count: number }>();
  for (const node of index.nodes) {
    if (!clusters.has(node.index_file)) {
      clusters.set(node.index_file, { node_count: 0, edge_count: 0 });
    }
    clusters.get(node.index_file)!.node_count += 1;
  }
  for (const edge of index.edges) {
    const node = index.nodes.find((n) => n.node_id === edge.from_node_id);
    const indexFile = node?.index_file ?? "unknown";
    if (!clusters.has(indexFile)) {
      clusters.set(indexFile, { node_count: 0, edge_count: 0 });
    }
    clusters.get(indexFile)!.edge_count += 1;
  }
  return {
    clusters: [...clusters.entries()]
      .map(([index_file, stats]) => ({ index_file, ...stats }))
      .sort((a, b) => a.index_file.localeCompare(b.index_file)),
    totals: {
      nodes: index.nodes.length,
      edges: index.edges.length,
      files: index.files.length,
    },
  };
}

export function traceCorpusGraphNode(
  index: CorpusGraphIndex,
  nodeId: string,
  depth = 1,
): CorpusGraphTraceView {
  const node = index.nodes.find((n) => n.node_id === nodeId);
  if (!node) {
    return { node_id: nodeId, depth, references: [] };
  }
  const refs = new Set<string>();
  for (const edge of index.edges) {
    if (edge.from_node_id !== nodeId) continue;
    if (edge.kind === "references" && TOKEN_KEY.test(edge.to_node_id)) {
      refs.add(edge.to_node_id);
    }
  }
  if (depth > 1) {
    for (const r of [...refs]) {
      for (const edge of index.edges) {
        if (edge.from_node_id === r && edge.kind === "references" && TOKEN_KEY.test(edge.to_node_id)) {
          refs.add(edge.to_node_id);
        }
      }
    }
  }
  return {
    node_id: nodeId,
    depth,
    detail_path: node.detail_path,
    references: [...refs].sort(),
  };
}

export async function checkCorpusGraphFreshness(input: {
  repo_root: string;
  index: CorpusGraphIndex;
  tied_project_rel?: string;
}): Promise<{ ok: boolean; content_hash: string; diagnostics: CorpusGraphDiagnostic[] }> {
  const scanned = await scanCorpusProject({
    repo_root: input.repo_root,
    tied_project_rel: input.tied_project_rel ?? input.index.tied_project_rel,
  });
  const ok = scanned.content_hash === input.index.content_hash;
  return {
    ok,
    content_hash: scanned.content_hash,
    diagnostics: ok
      ? []
      : [
          {
            code: "STALE_INDEX",
            message: `Index hash ${input.index.content_hash} differs from live corpus ${scanned.content_hash}`,
          },
        ],
  };
}

export { DEFAULT_INDEX_REL, PROOF_BOUNDARY };
