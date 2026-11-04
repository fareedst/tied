/**
 * [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] [IMPL-TIED_ENVIRONMENT_VARIABLE_POLICY]
 * [ARCH-TIED_ENVIRONMENT_VARIABLE_POLICY]
 * How: RUN_ENV_ALLOWLIST_INVENTORY — static scan for process.env reads against committed allowlist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { globMatch } from "./stale-layout-allowlist.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_ALLOWLIST_REL =
  "tools/bootstrap/fixtures/tied-env-allowlist/env-allowlist.v1.yaml";

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const ENV_DOT_RE = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
const ENV_BRACKET_RE = /process\.env\[['"]([A-Za-z_][A-Za-z0-9_]*)['"]\]/g;

export class UndocumentedEnvReadError extends Error {
  /**
   * @param {Record<string, { relativePath: string, line: number }[]>} violations
   */
  constructor(violations) {
    const lines = Object.keys(violations)
      .sort()
      .flatMap((key) =>
        violations[key].map((loc) => `  ${key}: ${loc.relativePath}:${loc.line}`),
      );
    super(`UNDOCUMENTED_ENV_READ:\n${lines.join("\n")}`);
    this.name = "UndocumentedEnvReadError";
    this.violations = violations;
  }
}

/**
 * @param {string} allowlistPath
 */
export function loadEnvAllowlist(allowlistPath) {
  if (!fs.existsSync(allowlistPath)) {
    throw new Error(`ALLOWLIST_MISSING: ${allowlistPath}`);
  }
  const doc = yaml.load(fs.readFileSync(allowlistPath, "utf8"));
  if (!doc || typeof doc !== "object") {
    throw new Error("ALLOWLIST_SCHEMA_INVALID: root must be object");
  }
  if (doc.schema !== "tied-env-allowlist.v1") {
    throw new Error(`ALLOWLIST_SCHEMA_INVALID: schema=${doc.schema}`);
  }
  if (!Array.isArray(doc.scan_roots) || doc.scan_roots.length === 0) {
    throw new Error("ALLOWLIST_SCHEMA_INVALID: scan_roots required");
  }
  if (!Array.isArray(doc.entries) || doc.entries.length === 0) {
    throw new Error("ALLOWLIST_SCHEMA_INVALID: entries required");
  }
  for (const entry of doc.entries) {
    if (!entry?.env_key || !entry?.class || !entry?.owner_req) {
      throw new Error(`ALLOWLIST_SCHEMA_INVALID: entry missing fields ${JSON.stringify(entry)}`);
    }
  }
  return doc;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extractEnvKeysFromSource(text) {
  /** @type {Set<string>} */
  const keys = new Set();
  for (const re of [ENV_DOT_RE, ENV_BRACKET_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      keys.add(match[1]);
    }
  }
  return [...keys];
}

/**
 * @param {string} relPosix path relative to store root
 * @param {readonly string[]} excludeGlobs
 */
export function isExcludedScanPath(relPosix, excludeGlobs) {
  const norm = relPosix.replace(/\\/g, "/");
  return excludeGlobs.some((glob) => globMatch(glob, norm));
}

/**
 * @param {string} storeRoot
 * @param {string} absPath
 */
function lineNumberForKey(text, envKey) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const slice = lines[i];
    if (
      slice.includes(`process.env.${envKey}`) ||
      slice.includes(`process.env['${envKey}']`) ||
      slice.includes(`process.env["${envKey}"]`)
    ) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * @param {string} storeRoot
 * @param {ReturnType<typeof loadEnvAllowlist>} allowlistDoc
 * @returns {Map<string, { relativePath: string, line: number }[]>}
 */
export function collectEnvReadsFromSources(storeRoot, allowlistDoc) {
  const excludeGlobs = allowlistDoc.scan_exclude_globs ?? [];
  /** @type {Map<string, { relativePath: string, line: number }[]>} */
  const collected = new Map();

  for (const root of allowlistDoc.scan_roots) {
    const absRoot = path.join(storeRoot, root);
    if (!fs.existsSync(absRoot)) {
      throw new Error(`SCAN_ROOT_MISSING: ${absRoot}`);
    }
    walkFiles(absRoot, (absFile) => {
      const relFromStore = path.relative(storeRoot, absFile).replace(/\\/g, "/");
      if (isExcludedScanPath(relFromStore, excludeGlobs)) {
        return;
      }
      const ext = path.extname(absFile);
      if (!SOURCE_EXTENSIONS.has(ext)) {
        return;
      }
      const text = fs.readFileSync(absFile, "utf8");
      for (const key of extractEnvKeysFromSource(text)) {
        if (!collected.has(key)) {
          collected.set(key, []);
        }
        const list = collected.get(key);
        const line = lineNumberForKey(text, key);
        const relativePath = relFromStore;
        if (!list.some((e) => e.relativePath === relativePath && e.line === line)) {
          list.push({ relativePath, line });
        }
      }
    });
  }
  return collected;
}

/**
 * @param {string} dir
 * @param {(file: string) => void} onFile
 */
function walkFiles(dir, onFile) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) {
      walkFiles(abs, onFile);
    } else if (name.isFile()) {
      onFile(abs);
    }
  }
}

/**
 * @param {Map<string, { relativePath: string, line: number }[]>} collectedReads
 * @param {ReturnType<typeof loadEnvAllowlist>} allowlistDoc
 */
export function assertReadsAllowlisted(collectedReads, allowlistDoc) {
  const allowlisted = new Set(allowlistDoc.entries.map((e) => e.env_key));
  /** @type {Record<string, { relativePath: string, line: number }[]>} */
  const violations = {};
  for (const [key, locations] of collectedReads) {
    if (!allowlisted.has(key)) {
      violations[key] = locations;
    }
  }
  if (Object.keys(violations).length > 0) {
    throw new UndocumentedEnvReadError(violations);
  }
}

/**
 * @param {{ allowlistPath?: string, storeRoot?: string }} [opts]
 */
export function runEnvAllowlistInventory(opts = {}) {
  const storeRoot = opts.storeRoot ?? TIED_REPO_ROOT;
  const allowlistPath =
    opts.allowlistPath ?? path.join(TIED_REPO_ROOT, DEFAULT_ALLOWLIST_REL);
  const allowlistDoc = loadEnvAllowlist(allowlistPath);
  const reads = collectEnvReadsFromSources(storeRoot, allowlistDoc);
  assertReadsAllowlisted(reads, allowlistDoc);
  return { ok: true, keysScanned: reads.size, allowlistPath, storeRoot };
}

export function defaultAllowlistPath() {
  return path.join(TIED_REPO_ROOT, DEFAULT_ALLOWLIST_REL);
}
