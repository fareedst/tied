/**
 * Detail YAML file loader for TIED REQ/ARCH/IMPL detail files.
 * One file per token: {base}/{subdir}/{token}.yaml with single top-level key = token.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getBasePath, updateRecord, type IndexName } from "./yaml-loader.js";

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
 * Resolve filesystem path for a detail file. Returns null if token is not REQ-*, ARCH-*, or IMPL-*.
 */
export function getDetailPath(token: string): string | null {
  const type = getDetailType(token);
  if (!type) return null;
  const base = getBasePath();
  const subdir = SUBDIRS[type];
  return path.join(base, subdir, `${token}.yaml`);
}

/**
 * Load a detail file and return the record (value of the single top-level key). Returns null if missing or invalid.
 */
export function loadDetail(token: string): Record<string, unknown> | null {
  const filePath = getDetailPath(token);
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(raw) as unknown;
    if (data === null || typeof data !== "object" || Array.isArray(data)) return null;
    const record = (data as Record<string, unknown>)[token];
    if (record === null || typeof record !== "object" || Array.isArray(record)) return null;
    return record as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * List tokens that have a detail file in the given type's directory.
 */
export function listDetailTokens(type: DetailType): string[] {
  const base = getBasePath();
  const subdir = SUBDIRS[type];
  const dir = path.join(base, subdir);
  if (!fs.existsSync(dir)) return [];
  try {
    const names = fs.readdirSync(dir);
    return names
      .filter((n) => n.endsWith(".yaml"))
      .map((n) => n.slice(0, -5));
  } catch {
    return [];
  }
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
    const out = yaml.dump({ [token]: record }, { sortKeys: false, lineWidth: -1 });
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
 */
export function updateDetail(token: string, updates: Record<string, unknown>): { ok: true } | { ok: false; error: string } {
  const existing = loadDetail(token);
  if (!existing) {
    const filePath = getDetailPath(token);
    if (!filePath) return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
    return { ok: false, error: `No detail file found for token: ${token}` };
  }
  const merged = { ...existing, ...updates };
  const filePath = getDetailPath(token)!;
  try {
    const out = yaml.dump({ [token]: merged }, { sortKeys: false, lineWidth: -1 });
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
