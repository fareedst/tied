/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: LOAD_INSTALL_TARGETS_YAML and FILTER_INSTALL_TARGETS for batch tied-install.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { globMatch } from "./stale-layout-allowlist.mjs";

/**
 * @param {string} p
 */
export function expandHomePath(p) {
  if (p === "~") {
    return os.homedir();
  }
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

/**
 * @param {unknown} entry
 * @param {string} baseDir
 */
export function normalizeInstallTargetEntry(entry, baseDir) {
  let raw;
  if (typeof entry === "string") {
    raw = entry.trim();
  } else if (entry && typeof entry === "object" && typeof entry.path === "string") {
    raw = entry.path.trim();
  } else {
    throw new Error("TARGETS_YAML_INVALID");
  }
  if (!raw) {
    throw new Error("TARGETS_YAML_INVALID");
  }
  raw = expandHomePath(raw);
  const resolved = path.isAbsolute(raw) ? raw : path.resolve(baseDir, raw);
  return path.resolve(resolved);
}

/**
 * @param {unknown} doc
 * @returns {unknown[]}
 */
export function extractTargetsListFromYamlDocument(doc) {
  if (Array.isArray(doc)) {
    return doc;
  }
  if (doc && typeof doc === "object" && Array.isArray(doc.targets)) {
    return doc.targets;
  }
  throw new Error("TARGETS_YAML_INVALID");
}

/**
 * @param {string} source path or "-"
 * @param {{ baseDir: string, readStdin?: () => string, readFile?: typeof fs.readFileSync }} [options]
 */
export function loadInstallTargetsYaml(source, options = {}) {
  const readFile = options.readFile ?? fs.readFileSync.bind(fs);
  const readStdin = options.readStdin ?? (() => fs.readFileSync(0, "utf8"));
  let text;
  if (source === "-") {
    text = readStdin();
  } else {
    text = readFile(source, "utf8");
  }
  let doc;
  try {
    doc = yaml.load(text);
  } catch {
    throw new Error("TARGETS_YAML_INVALID");
  }
  const list = extractTargetsListFromYamlDocument(doc);
  if (list.length === 0) {
    throw new Error("TARGETS_LIST_EMPTY");
  }
  const baseDir = source === "-" ? options.baseDir : path.dirname(path.resolve(source));
  return list.map((entry) => normalizeInstallTargetEntry(entry, baseDir));
}

/**
 * @param {string[]} paths
 */
export function dedupeInstallTargets(paths) {
  const seen = new Set();
  const out = [];
  for (const p of paths) {
    const norm = path.resolve(p);
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/**
 * @param {string} targetPath absolute path
 * @param {string | undefined} glob
 */
function pathMatchesGlob(targetPath, glob) {
  if (!glob) return true;
  return globMatch(glob, targetPath) || globMatch(glob, targetPath.replace(/\\/g, "/"));
}

/**
 * @param {string[]} paths
 * @param {{
 *   includeGlob?: string,
 *   excludeGlob?: string,
 *   skipMissing?: boolean,
 *   onlyInstalled?: boolean,
 *   existsSync?: (p: string) => boolean,
 *   readManifest?: (projectRoot: string) => unknown,
 * }} options
 */
export function filterInstallTargets(paths, options = {}) {
  const existsSync = options.existsSync ?? fs.existsSync.bind(fs);
  const readManifest = options.readManifest ?? (() => null);
  const missing = [];

  let filtered = paths.map((p) => path.resolve(p));

  if (options.includeGlob) {
    filtered = filtered.filter((p) => pathMatchesGlob(p, options.includeGlob));
  }
  if (options.excludeGlob) {
    filtered = filtered.filter((p) => !pathMatchesGlob(p, options.excludeGlob));
  }

  const next = [];
  for (const p of filtered) {
    let isDir = false;
    if (existsSync(p)) {
      try {
        isDir = fs.statSync(p).isDirectory();
      } catch {
        isDir = true;
      }
    }
    if (!isDir) {
      if (options.skipMissing) {
        missing.push(p);
        continue;
      }
      throw new Error(`TARGETS_PATH_MISSING:${p}`);
    }
    if (options.onlyInstalled && !readManifest(p)) {
      continue;
    }
    next.push(p);
  }

  if (next.length === 0) {
    throw new Error("TARGETS_FILTER_EMPTY");
  }
  return { paths: next, skippedMissing: missing };
}

/**
 * @param {string[]} paths
 * @param {{ existsSync?: (p: string) => boolean }} [options]
 */
export function assertInstallTargetDirectories(paths, options = {}) {
  const existsSync = options.existsSync ?? fs.existsSync.bind(fs);
  for (const p of paths) {
    if (!existsSync(p) || !fs.statSync(p).isDirectory()) {
      throw new Error(`TARGETS_PATH_MISSING:${p}`);
    }
  }
}
