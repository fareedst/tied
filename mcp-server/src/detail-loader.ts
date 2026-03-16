/**
 * Detail file loader for TIED REQ/ARCH/IMPL.
 * Resolves path from index detail_file when present (supports .md and .yaml); otherwise
 * {base}/{subdir}/{token}.yaml. Hybrid layout: index may point to .md or .yaml per token.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getBasePath, getRecord, loadIndex, updateRecord, type IndexName } from "./yaml-loader.js";
import { safeDump } from "./yaml-dump.js";

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
 * Resolve filesystem path for a detail file. Uses index detail_file when present (hybrid .md/.yaml);
 * otherwise falls back to {subdir}/{token}.yaml then {subdir}/{token}.md. Returns null if token invalid.
 */
export function getDetailPath(token: string): string | null {
  const type = getDetailType(token);
  if (!type) return null;
  const base = getBasePath();
  const subdir = SUBDIRS[type];
  const indexName = getIndexName(token);
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
  return yamlPath;
}

/** Sentinel keys for markdown detail content (hybrid layout). */
export const DETAIL_MARKDOWN_RAW = "_raw_markdown";
export const DETAIL_FORMAT = "_format";

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
    const data = yaml.load(raw) as unknown;
    if (data === null || typeof data !== "object" || Array.isArray(data)) return null;
    const record = (data as Record<string, unknown>)[token];
    if (record === null || typeof record !== "object" || Array.isArray(record)) return null;
    return record as Record<string, unknown>;
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
        else if (n.endsWith(".md")) seen.add(n.slice(0, -3));
      }
    } catch {
      // ignore
    }
  }
  return [...seen].sort();
}

/**
 * Write a new detail file. Fails if file already exists. Creates parent directory if needed.
 * On success, optionally updates the index record's detail_file to the relative path.
 */
export function writeDetail(
  token: string,
  record: Record<string, unknown>,
  options?: { syncIndex?: boolean }
): { ok: true } | { ok: false; error: string } {
  const filePath = getDetailPath(token);
  if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  if (fs.existsSync(filePath)) return { ok: false, error: `Detail file already exists: ${token}` };
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const out = safeDump({ [token]: record });
    fs.writeFileSync(filePath, out, "utf8");
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
 * Fails if the detail file is markdown (hybrid layout); use a text editor to edit .md.
 */
export function updateDetail(token: string, updates: Record<string, unknown>): { ok: true } | { ok: false; error: string } {
  const existing = loadDetail(token);
  if (!existing) {
    const filePath = getDetailPath(token);
    if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
    return { ok: false, error: `No detail file found for token: ${token}` };
  }
  if (existing[DETAIL_FORMAT] === "markdown") {
    return { ok: false, error: `Detail file for ${token} is markdown; edit the .md file directly` };
  }
  const merged = { ...existing, ...updates };
  const filePath = getDetailPath(token)!;
  try {
    const out = safeDump({ [token]: merged });
    fs.writeFileSync(filePath, out, "utf8");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Delete a detail file. If syncIndex is true, sets the index record's detail_file to null for that token.
 */
export function deleteDetail(
  token: string,
  options?: { syncIndex?: boolean }
): { ok: true } | { ok: false; error: string } {
  const filePath = getDetailPath(token);
  if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  if (!fs.existsSync(filePath)) return { ok: false, error: `No detail file found for token: ${token}` };
  try {
    fs.unlinkSync(filePath);
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
