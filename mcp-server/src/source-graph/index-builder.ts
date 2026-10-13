/**
 * [IMPL-TIED_SOURCE_GRAPH_REFRESH] [IMPL-TIED_SOURCE_GRAPH_MAP] [IMPL-TIED_SOURCE_GRAPH_TRAVERSE]
 * [ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";
import ts from "typescript";

import {
  INDEX_SCHEMA_VERSION,
  PROOF_BOUNDARY,
  type SourceGraphEdge,
  type SourceGraphIndex,
  type SourceGraphMapView,
  type SourceGraphSymbol,
  type SourceGraphTraceView,
} from "./types.js";

const DEFAULT_INDEX_REL = "tied-bundle/reports/source-graph/source-graph-index.v1.json";

function hashContent(parts: string[]): string {
  return createHash("sha256").update(parts.join("\0")).digest("hex");
}

function relativeId(file: string, name: string): string {
  return `${file}#${name}`;
}

function parseFile(
  filePath: string,
  relFile: string,
  symbols: SourceGraphSymbol[],
  edges: SourceGraphEdge[],
  importMap: Map<string, Map<string, string>>,
): void {
  const source = ts.createSourceFile(
    filePath,
    ts.sys.readFile(filePath) ?? "",
    ts.ScriptTarget.Latest,
    true,
    relFile.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const localFunctions = new Set<string>();

  function visit(node: ts.Node): void {
    if (ts.isFunctionDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      const exported = Boolean(
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword),
      );
      const name = node.name.text;
      localFunctions.add(name);
      symbols.push({
        symbol_id: relativeId(relFile, name),
        file: relFile,
        kind: "function",
        name,
        exported,
      });
    }

    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      let resolved = path.normalize(path.join(path.dirname(relFile), spec)).replace(/\\/g, "/");
      if (resolved.endsWith(".js")) resolved = `${resolved.slice(0, -3)}.ts`;
      if (!resolved.endsWith(".ts") && !resolved.endsWith(".tsx")) resolved = `${resolved}.ts`;
      const targetFile = resolved;
      if (!importMap.has(relFile)) importMap.set(relFile, new Map());
      if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        for (const el of node.importClause.namedBindings.elements) {
          const local = el.name.text;
          const remote = el.propertyName?.text ?? local;
          importMap.get(relFile)!.set(local, relativeId(targetFile, remote));
          edges.push({
            from_symbol_id: relativeId(relFile, local),
            to_symbol_id: relativeId(targetFile, remote),
            kind: "imports",
          });
        }
      }
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const callee = node.expression.text;
      const fromFn = findEnclosingFunction(node);
      if (fromFn) {
        const fromId = relativeId(relFile, fromFn);
        let toId = relativeId(relFile, callee);
        const im = importMap.get(relFile)?.get(callee);
        if (im) toId = im;
        edges.push({ from_symbol_id: fromId, to_symbol_id: toId, kind: "calls" });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
}

function findEnclosingFunction(node: ts.Node): string | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
    current = current.parent;
  }
  return undefined;
}

export async function refreshSourceGraphIndex(input: {
  repo_root: string;
  index_rel_path?: string;
  glob?: string;
}): Promise<{ index: SourceGraphIndex; index_path: string }> {
  const repoRoot = path.resolve(input.repo_root);
  const pattern = input.glob ?? "**/*.{ts,tsx,js,jsx}";
  const files = await fg(pattern, {
    cwd: repoRoot,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/tied-bundle/reports/source-graph/**"],
  });

  const relFiles = files.map((f) => path.relative(repoRoot, f).replace(/\\/g, "/")).sort();
  const contentParts: string[] = [];
  const symbols: SourceGraphSymbol[] = [];
  const edges: SourceGraphEdge[] = [];
  const importMap = new Map<string, Map<string, string>>();

  for (const abs of files.sort()) {
    const rel = path.relative(repoRoot, abs).replace(/\\/g, "/");
    contentParts.push(await readFile(abs, "utf8"));
    parseFile(abs, rel, symbols, edges, importMap);
  }

  const index: SourceGraphIndex = {
    schema_version: INDEX_SCHEMA_VERSION,
    repo_root: repoRoot,
    content_hash: hashContent(contentParts),
    built_at: new Date().toISOString(),
    language_scope: ["typescript", "javascript"],
    symbols,
    edges,
    files: relFiles,
  };

  const indexRel = input.index_rel_path ?? DEFAULT_INDEX_REL;
  const indexPath = path.join(repoRoot, indexRel);
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  return { index, index_path: indexPath };
}

export async function loadSourceGraphIndex(indexPath: string): Promise<SourceGraphIndex> {
  const raw = await readFile(indexPath, "utf8");
  const parsed = JSON.parse(raw) as SourceGraphIndex;
  if (parsed.schema_version !== INDEX_SCHEMA_VERSION) {
    throw new Error(`INVALID_INDEX: expected ${INDEX_SCHEMA_VERSION}`);
  }
  return parsed;
}

export function buildSourceGraphMap(index: SourceGraphIndex): SourceGraphMapView {
  const clusters = new Map<string, { file_count: number; symbol_count: number; edge_count: number }>();
  for (const file of index.files) {
    const directory = path.posix.dirname(file) || ".";
    if (!clusters.has(directory)) {
      clusters.set(directory, { file_count: 0, symbol_count: 0, edge_count: 0 });
    }
    clusters.get(directory)!.file_count += 1;
  }
  for (const sym of index.symbols) {
    const directory = path.posix.dirname(sym.file) || ".";
    if (!clusters.has(directory)) {
      clusters.set(directory, { file_count: 0, symbol_count: 0, edge_count: 0 });
    }
    clusters.get(directory)!.symbol_count += 1;
  }
  for (const edge of index.edges) {
    const file = edge.from_symbol_id.split("#")[0] ?? "";
    const directory = path.posix.dirname(file) || ".";
    if (!clusters.has(directory)) {
      clusters.set(directory, { file_count: 0, symbol_count: 0, edge_count: 0 });
    }
    clusters.get(directory)!.edge_count += 1;
  }

  const clusterList = [...clusters.entries()]
    .map(([directory, stats]) => ({ directory, ...stats }))
    .sort((a, b) => a.directory.localeCompare(b.directory));

  return {
    clusters: clusterList,
    totals: {
      files: index.files.length,
      symbols: index.symbols.length,
      edges: index.edges.length,
    },
  };
}

export function traceSourceGraphSymbol(
  index: SourceGraphIndex,
  symbolId: string,
  depth = 1,
): SourceGraphTraceView {
  const exists = index.symbols.some((s) => s.symbol_id === symbolId);
  if (!exists) {
    return { symbol_id: symbolId, depth, callers: [], callees: [] };
  }

  const callers = new Set<string>();
  const callees = new Set<string>();

  for (const edge of index.edges) {
    if (edge.kind === "calls" && edge.to_symbol_id === symbolId) callers.add(edge.from_symbol_id);
    if (edge.kind === "calls" && edge.from_symbol_id === symbolId) callees.add(edge.to_symbol_id);
  }

  if (depth > 1) {
    for (const c of [...callees]) {
      for (const edge of index.edges) {
        if (edge.kind === "calls" && edge.from_symbol_id === c) callees.add(edge.to_symbol_id);
      }
    }
  }

  return {
    symbol_id: symbolId,
    depth,
    callers: [...callers].sort(),
    callees: [...callees].sort(),
  };
}

export async function checkSourceGraphFreshness(input: {
  repo_root: string;
  index: SourceGraphIndex;
  glob?: string;
}): Promise<{ ok: boolean; content_hash: string; diagnostics: Array<{ code: string; message: string }> }> {
  const repoRoot = path.resolve(input.repo_root);
  const pattern = input.glob ?? "**/*.{ts,tsx,js,jsx}";
  const files = await fg(pattern, {
    cwd: repoRoot,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/tied-bundle/reports/source-graph/**"],
  });
  const contentParts: string[] = [];
  for (const abs of files.sort()) {
    contentParts.push(await readFile(abs, "utf8"));
  }
  const liveHash = hashContent(contentParts);
  const ok = liveHash === input.index.content_hash;
  return {
    ok,
    content_hash: liveHash,
    diagnostics: ok
      ? []
      : [
          {
            code: "STALE_INDEX",
            message: `Index hash ${input.index.content_hash} differs from live tree ${liveHash}`,
          },
        ],
  };
}

export { DEFAULT_INDEX_REL, PROOF_BOUNDARY };
