/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: RESOLVE_STORE_ROOT, CHECK_STORE_REACHABLE, and client bundle path (tied-bundle/, legacy store layout).
 */
import fs from "node:fs";
import path from "node:path";
import { TIED_REPO_ROOT } from "../constants.mjs";
import { resolveTiedLayout } from "../layout.mjs";
import {
  materializeLinkedMethodologyBundle,
  resolveStoreDocsDir,
  resolveStoreMethodologyIndexRoot,
  resolveStoreSidecarTemplatePath,
  resolveStoreVocabDir,
} from "../methodology-bundle.mjs";

/**
 * @param {string} projectRoot
 * @returns {string | null}
 */
export function readStoreRootFromProjectMcp(projectRoot) {
  for (const rel of [".cursor/mcp.json", ".mcp.json"]) {
    const mcpPath = path.join(projectRoot, rel);
    if (!fs.existsSync(mcpPath)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
      const raw = cfg?.mcpServers?.["tied-yaml"]?.env?.TIED_STORE_ROOT;
      if (typeof raw === "string" && raw.trim()) {
        return path.resolve(raw.trim());
      }
    } catch {
      /* invalid JSON — try next file */
    }
  }
  return null;
}

/**
 * @param {{ store?: string, env?: NodeJS.ProcessEnv, projectRoot?: string }} options
 */
export function resolveStoreRoot(options = {}) {
  const env = options.env ?? process.env;
  let resolved;
  if (options.store?.trim()) {
    resolved = path.resolve(options.store.trim());
  } else if (env.TIED_STORE_ROOT?.trim()) {
    resolved = path.resolve(env.TIED_STORE_ROOT.trim());
  } else if (options.projectRoot) {
    const fromMcp = readStoreRootFromProjectMcp(options.projectRoot);
    if (fromMcp) {
      resolved = fromMcp;
    }
  }
  if (!resolved && env.TIED_REPO_ROOT?.trim()) {
    resolved = path.resolve(env.TIED_REPO_ROOT.trim());
  }
  if (!resolved) {
    resolved = TIED_REPO_ROOT;
  }
  return resolved;
}

/**
 * @param {"live"|"pinned"} choice
 * @param {string} storeRoot
 * @param {string} [projectRoot] when set, materializes or returns client tied-bundle/
 */
export function resolveMethodologyBundlePath(choice, storeRoot, projectRoot) {
  if (projectRoot) {
    const layout = resolveTiedLayout(projectRoot);
    const sentinel = path.join(layout.bundleDir, "requirements.yaml");
    if (fs.existsSync(sentinel)) {
      return layout.bundleDir;
    }
    return materializeLinkedMethodologyBundle(projectRoot, storeRoot, choice);
  }
  if (choice === "pinned") {
    const pinned = path.join(storeRoot, "mcp-server", "methodology-bundle", "corpus");
    if (fs.existsSync(path.join(pinned, "requirements.yaml"))) {
      return pinned;
    }
  }
  return resolveStoreMethodologyIndexRoot(storeRoot);
}

/** @param {string} storeRoot */
export function checkStoreReachable(storeRoot) {
  const required = [
    path.join(storeRoot, "tools", "bundled-prompt-type-skills"),
    path.join(storeRoot, "tools", "bundled-tied-yaml-skill"),
    path.join(storeRoot, "mcp-server", "dist", "index.js"),
    resolveStoreVocabDir(storeRoot),
    resolveStoreSidecarTemplatePath(storeRoot),
    resolveStoreDocsDir(storeRoot),
  ];

  resolveStoreMethodologyIndexRoot(storeRoot);

  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length > 0) {
    const err = new Error("STORE_UNREACHABLE");
    err.missing = missing;
    throw err;
  }
  return { storeRoot, checked: required.length };
}
