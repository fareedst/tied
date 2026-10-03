/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: RESOLVE_WORKING_ROOT + artifact classification (mirror mcp-server/src/working-root.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { resolveTiedLayout } from "./layout.mjs";

export const LOCAL_WORKING_PREFIXES = [
  "gates/",
  "gate-",
  "adversarial-inquiry/",
  "adherence/",
  "jev/",
  "pseudocode-analysis/",
];

/**
 * @param {string} relativePath
 * @returns {"committed"|"local"}
 */
export function classifyWorkingRelativePath(relativePath) {
  const norm = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const prefix of LOCAL_WORKING_PREFIXES) {
    if (norm.startsWith(prefix)) return "local";
  }
  if (norm.endsWith("-ledger.jsonl") || norm.includes("/ledger.jsonl")) return "local";
  if (/-CLIENT-/.test(norm)) return "local";
  return "committed";
}

/**
 * @param {string} projectRoot
 */
export function isUndividedWorkingLayout(projectRoot) {
  const root = path.resolve(projectRoot);
  const layout = resolveTiedLayout(root);
  if (fs.existsSync(layout.workingCommittedRoot)) return false;
  return fs.existsSync(path.join(root, "working"));
}

/**
 * @param {string} projectRoot
 * @param {string} requestToken
 * @param {"committed"|"local"} kind
 */
export function resolveRequestWorkingBase(projectRoot, requestToken, kind) {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", requestToken);
  }
  const layout = resolveTiedLayout(root);
  const base =
    kind === "committed" ? layout.workingCommittedRoot : layout.workingLocalRoot;
  return path.join(base, requestToken);
}

/**
 * @param {string} projectRoot
 * @param {string} requestToken
 * @param {...string} parts
 */
export function resolveWorkingPath(projectRoot, requestToken, ...parts) {
  const relative = parts.map(String).join("/");
  const kind = parts.length ? classifyWorkingRelativePath(relative) : "committed";
  const base = resolveRequestWorkingBase(projectRoot, requestToken, kind);
  return parts.length ? path.join(base, ...parts) : base;
}

/** Recommended globs for local working (tied-bundle/working) when splitting gitignore. */
export const LOCAL_WORKING_GITIGNORE_GLOBS = [
  "tied-bundle/working/**/gates/",
  "tied-bundle/working/**/adversarial-inquiry/",
  "tied-bundle/working/**/adherence/",
  "tied-bundle/working/**/jev/",
  "tied-bundle/working/**/*-ledger.jsonl",
];

/**
 * @param {string} projectRoot
 * @param {...string} parts
 */
export function resolveGlobalLocalWorkingPath(projectRoot, ...parts) {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", ...parts);
  }
  const layout = resolveTiedLayout(root);
  return path.join(layout.workingLocalRoot, ...parts);
}

/** @param {string} projectRoot */
export function committedWorkingRelPrefix(projectRoot) {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return "working";
  }
  const layout = resolveTiedLayout(root);
  return path.relative(root, layout.workingCommittedRoot).split(path.sep).join("/");
}

/** @param {string} projectRoot @param {...string} parts */
export function resolveCommittedWorkingPath(projectRoot, ...parts) {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", ...parts);
  }
  const layout = resolveTiedLayout(root);
  return path.join(layout.workingCommittedRoot, ...parts);
}

/** @param {string} projectRoot @param {...string} parts */
export function committedWorkingFileRel(projectRoot, ...parts) {
  return path
    .relative(path.resolve(projectRoot), resolveCommittedWorkingPath(projectRoot, ...parts))
    .split(path.sep)
    .join("/");
}

const REQ_DIR_RE = /^REQ-[A-Z0-9_]+$/;

/** @param {string} projectRoot */
export function listRequestWorkingTokens(projectRoot) {
  const root = path.resolve(projectRoot);
  /** @type {Set<string>} */
  const tokens = new Set();
  const scan = (base) => {
    if (!fs.existsSync(base)) return;
    for (const entry of fs.readdirSync(base)) {
      if (REQ_DIR_RE.test(entry)) tokens.add(entry);
    }
  };
  if (isUndividedWorkingLayout(root)) {
    scan(path.join(root, "working"));
    return [...tokens].sort();
  }
  const layout = resolveTiedLayout(root);
  scan(layout.workingCommittedRoot);
  scan(layout.workingLocalRoot);
  return [...tokens].sort();
}

/**
 * @param {string} projectRoot
 * @param {string} requestToken
 * @param {...string} parts
 */
export function workingPathRelativeToProject(projectRoot, requestToken, ...parts) {
  const abs = resolveWorkingPath(projectRoot, requestToken, ...parts);
  return path.relative(path.resolve(projectRoot), abs).split(path.sep).join("/");
}
