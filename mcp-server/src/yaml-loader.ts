/**
 * YAML index loader with path resolution for TIED indexes.
 * Supports methodology/project split [PROC-TIED_METHODOLOGY_READONLY]: when tied/methodology/
 * exists, methodology index is read-only and merged with project index (project overrides);
 * writes go only to project files (tied/ root).
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { safeDump } from "./yaml-dump.js";

export type IndexName =
  | "requirements"
  | "architecture"
  | "implementation"
  | "semantic-tokens";

const INDEX_FILES: Record<IndexName, string> = {
  requirements: "requirements.yaml",
  architecture: "architecture-decisions.yaml",
  implementation: "implementation-decisions.yaml",
  "semantic-tokens": "semantic-tokens.yaml",
};

let cachedBasePath: string | null = null;

/**
 * Clear cached base path (for tests). [IMPL] Allows tests to re-resolve TIED_BASE_PATH.
 */
export function clearBasePathCache(): void {
  cachedBasePath = null;
}

/**
 * Resolve base path for YAML indexes. Uses TIED_BASE_PATH env; default "tied".
 * Resolved relative to process.cwd(). This is the project (writable) root.
 */
export function getBasePath(): string {
  if (cachedBasePath !== null) return cachedBasePath;
  const env = process.env.TIED_BASE_PATH ?? "tied";
  cachedBasePath = path.isAbsolute(env) ? env : path.resolve(process.cwd(), env);
  return cachedBasePath;
}

/**
 * Path to methodology directory (tied/methodology/). Null if it does not exist.
 * Methodology is read-only; project data lives at getBasePath() root.
 */
export function getMethodologyBasePath(): string | null {
  const base = getBasePath();
  const methodologyDir = path.join(base, "methodology");
  if (fs.existsSync(methodologyDir) && fs.statSync(methodologyDir).isDirectory()) {
    return methodologyDir;
  }
  return null;
}

function loadYamlFile(filePath: string): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(raw) as unknown;
    if (data !== null && typeof data === "object" && !Array.isArray(data))
      return data as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

/**
 * Load methodology index only (tied/methodology/{index}.yaml). Returns null if no methodology dir.
 */
export function loadMethodologyIndex(index: IndexName): Record<string, unknown> | null {
  const methodologyDir = getMethodologyBasePath();
  if (!methodologyDir) return null;
  const filePath = path.join(methodologyDir, INDEX_FILES[index]);
  return loadYamlFile(filePath);
}

/**
 * Load project index only (tied/{index}.yaml). Fallback to cwd when file not under base.
 */
export function loadProjectIndex(index: IndexName): Record<string, unknown> | null {
  const base = getBasePath();
  const fileName = INDEX_FILES[index];
  const primary = path.join(base, fileName);
  if (fs.existsSync(primary)) return loadYamlFile(primary);
  const fallbackCwd = path.resolve(process.cwd(), fileName);
  if (fs.existsSync(fallbackCwd)) return loadYamlFile(fallbackCwd);
  return loadYamlFile(primary);
}

/**
 * Resolve path to an index file for reading. Prefers project index path (tied/{index}.yaml);
 * fallback to cwd when tied/ has no index (legacy/template mode).
 */
export function resolveIndexPath(index: IndexName): string {
  const base = getBasePath();
  const fileName = INDEX_FILES[index];
  const primary = path.join(base, fileName);
  if (fs.existsSync(primary)) return primary;
  const fallbackCwd = path.resolve(process.cwd(), fileName);
  if (fs.existsSync(fallbackCwd)) return fallbackCwd;
  return primary;
}

/**
 * Load and parse index: merged view when methodology exists (methodology + project, project overrides);
 * otherwise single project/legacy file. Returns record of token -> data or null if missing/invalid.
 */
export function loadIndex(index: IndexName): Record<string, unknown> | null {
  const methodology = loadMethodologyIndex(index);
  const project = loadProjectIndex(index);
  if (methodology == null) return project;
  const merged = { ...methodology };
  if (project) {
    for (const [k, v] of Object.entries(project)) {
      if (k.startsWith("#") || typeof v !== "object" || v === null) continue;
      merged[k] = v;
    }
  }
  return merged;
}

/**
 * True when the token exists in the methodology index (read-only in client).
 * Used to resolve detail file path: methodology tokens read from tied/methodology/... .
 */
export function isTokenInMethodology(index: IndexName, token: string): boolean {
  const data = loadMethodologyIndex(index);
  if (!data || !(token in data)) return false;
  const val = data[token];
  return typeof val === "object" && val !== null;
}

/**
 * Get a single record by token from an index.
 */
export function getRecord(
  index: IndexName,
  token: string
): unknown | null {
  const data = loadIndex(index);
  if (!data || !(token in data)) return null;
  return data[token];
}

/**
 * Validate YAML syntax of an index file. Returns { valid: boolean, error?: string }.
 */
export function validateIndex(index: IndexName): { valid: boolean; error?: string } {
  try {
    const filePath = resolveIndexPath(index);
    if (!fs.existsSync(filePath))
      return { valid: false, error: `File not found: ${filePath}` };
    const raw = fs.readFileSync(filePath, "utf8");
    yaml.load(raw);
    return { valid: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { valid: false, error: message };
  }
}

/**
 * List all top-level keys (tokens) in an index.
 */
export function listTokens(index: IndexName): string[] {
  const data = loadIndex(index);
  if (!data) return [];
  return Object.keys(data).filter((k) => !k.startsWith("#") && typeof data[k] === "object");
}

/**
 * Filter records by a top-level field value (e.g. status, type).
 */
export function filterByField(
  index: IndexName,
  field: string,
  value: string
): Record<string, unknown> {
  const data = loadIndex(index);
  if (!data) return {};
  const out: Record<string, unknown> = {};
  for (const [token, record] of Object.entries(data)) {
    if (typeof record !== "object" || record === null) continue;
    const r = record as Record<string, unknown>;
    const f = r[field];
    if (String(f) === value) out[token] = r;
  }
  return out;
}

/**
 * Collect REQ-* tokens from a decision record (ARCH or IMPL).
 */
export function getReqTokensFromDecision(record: Record<string, unknown>): string[] {
  const reqs = new Set<string>();
  const cross = record.cross_references as unknown;
  if (Array.isArray(cross)) {
    for (const t of cross) if (typeof t === "string" && t.startsWith("REQ-")) reqs.add(t);
  }
  const trace = record.traceability as Record<string, unknown> | undefined;
  if (trace && Array.isArray(trace.requirements)) {
    for (const t of trace.requirements) if (typeof t === "string") reqs.add(t);
  }
  return [...reqs];
}

/**
 * Collect ARCH-* and IMPL-* tokens that reference a given requirement token.
 */
export function getDecisionsForRequirement(requirementToken: string): {
  architecture: Record<string, unknown>;
  implementation: Record<string, unknown>;
} {
  const arch: Record<string, unknown> = {};
  const impl: Record<string, unknown> = {};
  const archData = loadIndex("architecture");
  const implData = loadIndex("implementation");
  const reqData = loadIndex("requirements");

  const refsReq = (r: Record<string, unknown>) => {
    const cross = (r.cross_references as unknown) as string[] | undefined;
    const trace = r.traceability as Record<string, unknown> | undefined;
    const reqs = (trace?.requirements as string[] | undefined) ?? [];
    return [
      ...(Array.isArray(cross) ? cross.filter((t) => t === requirementToken) : []),
      ...reqs.filter((t) => t === requirementToken),
    ].length > 0;
  };

  if (archData) {
    for (const [token, record] of Object.entries(archData)) {
      if (typeof record === "object" && record !== null && refsReq(record as Record<string, unknown>))
        arch[token] = record;
    }
  }
  if (implData) {
    for (const [token, record] of Object.entries(implData)) {
      if (typeof record === "object" && record !== null && refsReq(record as Record<string, unknown>))
        impl[token] = record;
    }
  }

  const reqRecord = reqData?.[requirementToken] as Record<string, unknown> | undefined;
  if (reqRecord?.traceability) {
    const t = reqRecord.traceability as Record<string, unknown>;
    for (const a of (t.architecture as string[] | undefined) ?? []) arch[a] = archData?.[a] ?? { token: a };
    for (const i of (t.implementation as string[] | undefined) ?? []) impl[i] = implData?.[i] ?? { token: i };
  }

  return { architecture: arch, implementation: impl };
}

/**
 * Get all requirement tokens referenced by an ARCH or IMPL decision.
 */
export function getRequirementsForDecision(decisionToken: string): {
  requirementTokens: string[];
  requirements: Record<string, unknown>;
} {
  const reqTokens: string[] = [];
  const requirements: Record<string, unknown> = {};
  const isArch = decisionToken.startsWith("ARCH-");
  const index: IndexName = isArch ? "architecture" : "implementation";
  const data = loadIndex(index);
  const record = data?.[decisionToken] as Record<string, unknown> | undefined;
  if (!record) return { requirementTokens: [], requirements: {} };

  const cross = (record.cross_references as unknown) as string[] | undefined;
  const trace = record.traceability as Record<string, unknown> | undefined;
  const traceReqs = (trace?.requirements as string[] | undefined) ?? [];
  for (const t of [...(Array.isArray(cross) ? cross : []), ...traceReqs]) {
    if (typeof t === "string" && t.startsWith("REQ-") && !reqTokens.includes(t)) reqTokens.push(t);
  }

  const reqData = loadIndex("requirements");
  for (const rt of reqTokens) {
    if (reqData?.[rt]) requirements[rt] = reqData[rt];
  }
  return { requirementTokens: reqTokens, requirements };
}

/**
 * Return the path to use for writing an index file. Writes always go to {basePath}/{index}.yaml
 * so we do not overwrite template files.
 */
export function getWritableIndexPath(index: IndexName): string {
  const base = getBasePath();
  const fileName = INDEX_FILES[index];
  return path.join(base, fileName);
}

/**
 * Insert a new record. Fails if the token already exists or file cannot be written.
 * Creates the index file (and base directory) if it does not exist.
 */
export function insertRecord(
  index: IndexName,
  token: string,
  record: Record<string, unknown>
): { ok: true } | { ok: false; error: string } {
  try {
    const filePath = getWritableIndexPath(index);
    const data = loadIndex(index) ?? {};
    if (token in data) return { ok: false, error: `Token already exists: ${token}` };
    if (typeof data[token] === "object" && data[token] !== null)
      return { ok: false, error: `Token already exists: ${token}` };
    data[token] = record;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const out = safeDump(data);
    fs.writeFileSync(filePath, out, "utf8");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Update an existing record by merging the given object at the top level.
 * Fails if the token does not exist or file cannot be written.
 */
export function updateRecord(
  index: IndexName,
  token: string,
  updates: Record<string, unknown>
): { ok: true } | { ok: false; error: string } {
  try {
    const filePath = getWritableIndexPath(index);
    const data = loadIndex(index);
    if (!data || !(token in data))
      return { ok: false, error: `Token not found: ${token}` };
    const existing = data[token];
    if (typeof existing !== "object" || existing === null)
      return { ok: false, error: `Token is not a record: ${token}` };
    const merged = { ...(existing as Record<string, unknown>), ...updates };
    data[token] = merged;
    const out = safeDump(data);
    fs.writeFileSync(filePath, out, "utf8");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Insert or update a record. If the token exists and is an object, merges the given record
 * at the top level; otherwise sets the token to the given record. Creates the index file
 * (and base directory) if it does not exist.
 */
export function upsertRecord(
  index: IndexName,
  token: string,
  record: Record<string, unknown>
): { ok: true } | { ok: false; error: string } {
  try {
    const filePath = getWritableIndexPath(index);
    const data = loadIndex(index) ?? {};
    const existing = data[token];
    if (typeof existing === "object" && existing !== null) {
      data[token] = { ...(existing as Record<string, unknown>), ...record };
    } else {
      data[token] = record;
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const out = safeDump(data);
    fs.writeFileSync(filePath, out, "utf8");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
