/**
 * Detail file loader for TIED REQ/ARCH/IMPL.
 * Resolves path from index detail_file when present (supports .md and .yaml); otherwise
 * {base}/{subdir}/{token}.yaml. Hybrid layout: index may point to .md or .yaml per token.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  getBasePath,
  getMethodologyBasePath,
  getRecord,
  isTokenInMethodology,
  loadIndex,
  updateRecord,
  type IndexName,
} from "./yaml-loader.js";
import { safeDumpTiedDetailDoc } from "./yaml-dump.js";
import { mergeRecordUpdate } from "./record-merge.js";

export type DetailType = "requirement" | "architecture" | "implementation";

const SUBDIRS: Record<DetailType, string> = {
  requirement: "requirements",
  architecture: "architecture-decisions",
  implementation: "implementation-decisions",
};

function getIndexName(token: string): IndexName | null {
  if (token.startsWith("REQ-")) return "requirements";
  if (token.startsWith("ARCH-")) return "architecture";
  if (token.startsWith("IMPL-")) return "implementation";
  return null;
}

function getDetailType(token: string): DetailType | null {
  if (token.startsWith("REQ-")) return "requirement";
  if (token.startsWith("ARCH-")) return "architecture";
  if (token.startsWith("IMPL-")) return "implementation";
  return null;
}

/**
 * Base path for reading a token's detail: methodology dir if token is in methodology index,
 * else project root ([PROC-TIED_METHODOLOGY_READONLY]). Writing always uses project root.
 */
function getDetailBasePathForRead(token: string): string {
  const indexName = getIndexName(token);
  if (indexName && isTokenInMethodology(indexName, token)) {
    const methodologyBase = getMethodologyBasePath();
    if (methodologyBase) return methodologyBase;
  }
  return getBasePath();
}

/**
 * Resolve filesystem path for reading a detail file. Methodology tokens read from tied/methodology/...;
 * project tokens from tied/... . Uses index detail_file when present (hybrid .md/.yaml);
 * otherwise falls back to {subdir}/{token}.yaml then {subdir}/{token}.md. Returns null if token invalid.
 *
 * When a token is listed in the methodology index but the methodology copy has no detail file
 * (e.g. index-only seed rows with detail_file: null), the same path is retried under the project
 * base (tied/) so client-owned detail files still resolve.
 */
export function getDetailPath(token: string): string | null {
  const type = getDetailType(token);
  if (!type) return null;
  const subdir = SUBDIRS[type];
  const indexName = getIndexName(token);

  const tryBase = (base: string): string | null => {
    if (indexName) {
      const record = getRecord(indexName, token) as Record<string, unknown> | null;
      const detailFile = record?.detail_file;
      if (typeof detailFile === "string" && detailFile.trim()) {
        const fromIndex = path.join(base, detailFile);
        if (fs.existsSync(fromIndex)) return fromIndex;
      }
    }
    const yamlPath = path.join(base, subdir, `${token}.yaml`);
    if (fs.existsSync(yamlPath)) return yamlPath;
    const mdPath = path.join(base, subdir, `${token}.md`);
    if (fs.existsSync(mdPath)) return mdPath;
    return null;
  };

  if (indexName && isTokenInMethodology(indexName, token)) {
    const mb = getMethodologyBasePath();
    if (mb) {
      const p = tryBase(mb);
      if (p) return p;
    }
  }

  const projectPath = tryBase(getBasePath());
  if (projectPath) return projectPath;

  const defaultBase = getDetailBasePathForRead(token);
  return path.join(defaultBase, subdir, `${token}.yaml`);
}

/**
 * Path for writing a new detail file. Always project (tied/...), never methodology ([PROC-TIED_METHODOLOGY_READONLY]).
 */
export function getProjectDetailPath(token: string): string | null {
  const type = getDetailType(token);
  if (!type) return null;
  const base = getBasePath();
  const subdir = SUBDIRS[type];
  return path.join(base, subdir, `${token}.yaml`);
}

/**
 * Sibling file for IMPL essence pseudo-code: raw markdown / text next to the detail YAML
 * (e.g. `.../IMPL-FOO.yaml` and `.../IMPL-FOO-pseudocode.md`).
 */
export function getImplPseudocodeSidecarPath(detailYamlPath: string, token: string): string {
  return path.join(path.dirname(detailYamlPath), `${token}-pseudocode.md`);
}

/**
 * Write IMPL-TOKEN.yaml and optional IMPL-TOKEN-pseudocode.md. REQ/ARCH use YAML-only embedding via safeDumpTiedDetailDoc.
 */
function writeTiedDetailToDisk(token: string, filePath: string, record: Record<string, unknown>): void {
  const out = safeDumpTiedDetailDoc(token, record);
  fs.writeFileSync(filePath, out, "utf8");
  if (!token.startsWith("IMPL-")) return;
  const side = getImplPseudocodeSidecarPath(filePath, token);
  if (Object.prototype.hasOwnProperty.call(record, "essence_pseudocode")) {
    const ep = record.essence_pseudocode;
    if (typeof ep === "string") {
      if (ep.length > 0) {
        fs.writeFileSync(side, ep, "utf8");
      } else if (fs.existsSync(side)) {
        fs.unlinkSync(side);
      }
    }
  }
}

/** Sentinel keys for markdown detail content (hybrid layout). */
export const DETAIL_MARKDOWN_RAW = "_raw_markdown";
export const DETAIL_FORMAT = "_format";

/** Multi-doc YAML (e.g. tied/methodology/* bundled files): find the document whose top-level key is `token`. */
function yamlRecordForToken(raw: string, token: string): Record<string, unknown> | null {
  const docs = yaml.loadAll(raw) as unknown[];
  for (const data of docs) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) continue;
    const record = (data as Record<string, unknown>)[token];
    if (record !== null && typeof record === "object" && !Array.isArray(record)) {
      return record as Record<string, unknown>;
    }
  }
  return null;
}

/**
 * Load a detail file. For .yaml returns the record (value of the single top-level key).
 * For .md returns { _raw_markdown, _format: "markdown" }. Returns null if missing or invalid.
 */
export function loadDetail(token: string): Record<string, unknown> | null {
  const filePath = getDetailPath(token);
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    if (filePath.endsWith(".md")) {
      return { [DETAIL_MARKDOWN_RAW]: raw, [DETAIL_FORMAT]: "markdown" };
    }
    const record = yamlRecordForToken(raw, token);
    if (!record) return null;
    if (token.startsWith("IMPL-") && filePath.endsWith(".yaml")) {
      const side = getImplPseudocodeSidecarPath(filePath, token);
      if (fs.existsSync(side)) {
        const body = fs.readFileSync(side, "utf8");
        record.essence_pseudocode = body;
      }
    }
    return record;
  } catch {
    return null;
  }
}

const INDEX_BY_TYPE: Record<DetailType, IndexName> = {
  requirement: "requirements",
  architecture: "architecture",
  implementation: "implementation",
};

/**
 * List tokens that have a detail file: from index (detail_file set) plus filesystem (.yaml and .md in subdir).
 */
export function listDetailTokens(type: DetailType): string[] {
  const base = getBasePath();
  const subdir = SUBDIRS[type];
  const seen = new Set<string>();
  const indexName = INDEX_BY_TYPE[type];
  const indexData = loadIndex(indexName);
  if (indexData) {
    for (const [token, record] of Object.entries(indexData)) {
      if (typeof record === "object" && record !== null && (record as Record<string, unknown>).detail_file) seen.add(token);
    }
  }
  const dir = path.join(base, subdir);
  if (fs.existsSync(dir)) {
    try {
      const names = fs.readdirSync(dir);
      for (const n of names) {
        if (n.endsWith(".yaml")) seen.add(n.slice(0, -5));
        else if (n.endsWith(".md") && /-pseudocode\.md$/.test(n)) {
          // IMPL-FOO-pseudocode.md is a sidecar, not a top-level FOO-pseudocode token
          continue;
        } else if (n.endsWith(".md")) seen.add(n.slice(0, -3));
      }
    } catch {
      // ignore
    }
  }
  return [...seen].sort();
}

/**
 * Write a new detail file. Always writes to project (tied/...), never methodology [PROC-TIED_METHODOLOGY_READONLY].
 * Fails if project detail file already exists. Creates parent directory if needed.
 * On success, optionally updates the project index record's detail_file.
 */
export function writeDetail(
  token: string,
  record: Record<string, unknown>,
  options?: { syncIndex?: boolean }
): { ok: true } | { ok: false; error: string } {
  const filePath = getProjectDetailPath(token);
  if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  if (fs.existsSync(filePath)) return { ok: false, error: `Detail file already exists: ${token}` };
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    writeTiedDetailToDisk(token, filePath, record);
    if (options?.syncIndex) {
      const indexName = getIndexName(token);
      if (indexName) {
        const subdir = SUBDIRS[getDetailType(token)!];
        const detailFile = `${subdir}/${token}.yaml`;
        const res = updateRecord(indexName, token, { detail_file: detailFile });
        if (!res.ok) return res;
      }
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Update an existing detail file by merging the given object at the top level. Fails if file does not exist.
 * Fails if the detail file is under methodology (read-only) or markdown. [PROC-TIED_METHODOLOGY_READONLY]
 */
export function updateDetail(token: string, updates: Record<string, unknown>): { ok: true } | { ok: false; error: string } {
  const filePath = getDetailPath(token);
  if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  const methodologyBase = getMethodologyBasePath();
  if (methodologyBase && filePath.startsWith(methodologyBase)) {
    return { ok: false, error: `Token ${token} is methodology-owned (read-only); cannot update. Edit in TIED repo or add project override.` };
  }
  const existing = loadDetail(token);
  if (!existing) return { ok: false, error: `No detail file found for token: ${token}` };
  if (existing[DETAIL_FORMAT] === "markdown") {
    return { ok: false, error: `Detail file for ${token} is markdown; edit the .md file directly` };
  }
  const merged = mergeRecordUpdate(existing as Record<string, unknown>, updates);
  try {
    writeTiedDetailToDisk(token, filePath, merged);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Delete a detail file. Fails if the file is under methodology (read-only). [PROC-TIED_METHODOLOGY_READONLY]
 * If syncIndex is true, sets the project index record's detail_file to null for that token.
 */
/**
 * Append bullet strings to implementation_approach.details without replacing prior lines.
 * REQ-*, ARCH-*, IMPL-* detail files only; fails for markdown details or methodology paths.
 */
export function appendImplementationApproachDetails(
  token: string,
  detailsLines: string[]
): { ok: true } | { ok: false; error: string } {
  if (!token.startsWith("REQ-") && !token.startsWith("ARCH-") && !token.startsWith("IMPL-")) {
    return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  }
  const lines = detailsLines.map((s) => String(s).trim()).filter((s) => s.length > 0);
  if (lines.length === 0) return { ok: false, error: "details_lines must contain at least one non-empty string" };
  const existing = loadDetail(token);
  if (!existing) return { ok: false, error: `No detail file found for token: ${token}` };
  if (existing[DETAIL_FORMAT] === "markdown") {
    return { ok: false, error: `Detail file for ${token} is markdown; cannot append` };
  }
  const methodologyBase = getMethodologyBasePath();
  const filePath = getDetailPath(token);
  if (methodologyBase && filePath && filePath.startsWith(methodologyBase)) {
    return { ok: false, error: `Token ${token} is methodology-owned (read-only); cannot append.` };
  }
  const rec = existing as Record<string, unknown>;
  const prevIa = rec.implementation_approach;
  const prevObj = prevIa !== null && typeof prevIa === "object" && !Array.isArray(prevIa) ? (prevIa as Record<string, unknown>) : {};
  const prevDetails = Array.isArray(prevObj.details)
    ? (prevObj.details as unknown[]).map((x) => String(x))
    : [];
  const nextIa = {
    ...prevObj,
    details: [...prevDetails, ...lines],
  };
  return updateDetail(token, { implementation_approach: nextIa });
}

export function deleteDetail(
  token: string,
  options?: { syncIndex?: boolean }
): { ok: true } | { ok: false; error: string } {
  const filePath = getDetailPath(token);
  if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  const methodologyBase = getMethodologyBasePath();
  if (methodologyBase && filePath.startsWith(methodologyBase)) {
    return { ok: false, error: `Token ${token} is methodology-owned (read-only); cannot delete.` };
  }
  if (!fs.existsSync(filePath)) return { ok: false, error: `No detail file found for token: ${token}` };
  try {
    fs.unlinkSync(filePath);
    if (token.startsWith("IMPL-") && filePath.endsWith(".yaml")) {
      const side = getImplPseudocodeSidecarPath(filePath, token);
      if (fs.existsSync(side)) fs.unlinkSync(side);
    }
    if (options?.syncIndex) {
      const indexName = getIndexName(token);
      if (indexName) {
        const res = updateRecord(indexName, token, { detail_file: null });
        if (!res.ok) return res;
      }
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
