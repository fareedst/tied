/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Store corpus resolution and client tied-bundle materialization (replaces .linked-methodology-view).
 */
import fs from "node:fs";
import path from "node:path";
import { loadManifest } from "./constants.mjs";
import { BUNDLE_DIR_NAME, resolveTiedLayout } from "./layout.mjs";
import { isSourceOnlyVocab } from "./vocab.mjs";

/**
 * @param {string} storeRoot
 * @returns {string} Flattened methodology index root (bundle root shape).
 */
export function resolveStoreMethodologyIndexRoot(storeRoot) {
  const bundleRoot = path.join(storeRoot, BUNDLE_DIR_NAME);
  if (fs.existsSync(path.join(bundleRoot, "requirements.yaml"))) {
    return bundleRoot;
  }
  const templatesRoot = path.join(storeRoot, "templates");
  if (fs.existsSync(path.join(templatesRoot, "requirements.yaml"))) {
    return templatesRoot;
  }
  const liveMethodology = path.join(storeRoot, "tied", "methodology");
  if (fs.existsSync(path.join(liveMethodology, "requirements.yaml"))) {
    return liveMethodology;
  }
  throw new Error("STORE_METHODOLOGY_LAYOUT_MISSING");
}

/**
 * @param {string} storeRoot
 */
export function resolveStoreDocsDir(storeRoot) {
  const bundleDocs = path.join(storeRoot, BUNDLE_DIR_NAME, "docs");
  if (fs.existsSync(bundleDocs)) {
    return bundleDocs;
  }
  return path.join(storeRoot, "tied", "docs");
}

/**
 * @param {string} storeRoot
 */
export function resolveStoreSidecarTemplatePath(storeRoot) {
  const bundleTpl = path.join(
    storeRoot,
    BUNDLE_DIR_NAME,
    "templates",
    "impl-essence-pseudocode-template.md",
  );
  if (fs.existsSync(bundleTpl)) {
    return bundleTpl;
  }
  return path.join(storeRoot, "templates", "impl-essence-pseudocode-template.md");
}

/**
 * @param {string} storeRoot
 */
export function resolveStoreVocabDir(storeRoot) {
  const layout = resolveTiedLayout(storeRoot);
  return path.join(layout.tiedDir, "vocab");
}

/**
 * Store-side project traceability root (constitution, client indexes), not methodology corpus.
 * @param {string} storeRoot
 */
export function resolveStoreProjectSourceDir(storeRoot) {
  const layout = resolveTiedLayout(storeRoot);
  const modern = layout.tiedDir;
  if (
    fs.existsSync(path.join(modern, "constitution.example.yaml")) ||
    fs.existsSync(path.join(modern, "requirements.yaml"))
  ) {
    return modern;
  }
  const legacy = path.join(storeRoot, "tied");
  if (
    fs.existsSync(path.join(legacy, "constitution.example.yaml")) ||
    fs.existsSync(path.join(legacy, "requirements.yaml"))
  ) {
    return legacy;
  }
  return modern;
}

/**
 * @param {string} target
 * @param {string} linkDest
 */
function linkPath(target, linkDest) {
  if (!fs.existsSync(target)) return;
  fs.mkdirSync(path.dirname(linkDest), { recursive: true });
  if (fs.existsSync(linkDest)) {
    fs.rmSync(linkDest, { recursive: true, force: true });
  }
  fs.symlinkSync(target, linkDest, fs.statSync(target).isDirectory() ? "dir" : "file");
}

/**
 * @param {string} projectRoot
 * @param {string} storeRoot
 * @param {"live"|"pinned"} choice
 * @returns {string} Absolute client tied-bundle root (flattened methodology corpus).
 */
export function materializeLinkedMethodologyBundle(projectRoot, storeRoot, choice) {
  const layout = resolveTiedLayout(projectRoot);
  const bundleRoot = layout.bundleDir;
  if (fs.existsSync(path.join(bundleRoot, "requirements.yaml"))) {
    return bundleRoot;
  }

  if (choice === "pinned") {
    const pinned = path.join(storeRoot, "mcp-server", "methodology-bundle", "corpus");
    if (fs.existsSync(path.join(pinned, "requirements.yaml"))) {
      fs.mkdirSync(bundleRoot, { recursive: true });
      for (const name of fs.readdirSync(pinned)) {
        linkPath(path.join(pinned, name), path.join(bundleRoot, name));
      }
      return bundleRoot;
    }
  }

  const storeIndexRoot = resolveStoreMethodologyIndexRoot(storeRoot);
  fs.mkdirSync(bundleRoot, { recursive: true });

  const manifest = loadManifest();
  for (const f of manifest.INDEX_YAML_FILES ?? []) {
    linkPath(path.join(storeIndexRoot, f), path.join(bundleRoot, f));
  }
  for (const sub of ["requirements", "architecture-decisions", "implementation-decisions"]) {
    linkPath(path.join(storeIndexRoot, sub), path.join(bundleRoot, sub));
  }

  const vocabDest = layout.methodVocabDir;
  fs.mkdirSync(vocabDest, { recursive: true });
  const vocabSrc = resolveStoreVocabDir(storeRoot);
  if (fs.existsSync(vocabSrc)) {
    for (const name of fs.readdirSync(vocabSrc)) {
      if (!name.endsWith(".md")) continue;
      if (isSourceOnlyVocab(name, manifest.SOURCE_ONLY_VOCAB_BASENAMES ?? [])) continue;
      const dest = path.join(vocabDest, name);
      if (fs.existsSync(dest)) continue;
      linkPath(path.join(vocabSrc, name), dest);
    }
  }

  return bundleRoot;
}

/**
 * Strip legacy `methodology/` prefix from manifest-relative verify paths.
 * @param {string} rel
 */
export function bundleRelativeVerifyPath(rel) {
  const normalized = rel.replace(/\\/g, "/");
  return normalized.startsWith("methodology/") ? normalized.slice("methodology/".length) : normalized;
}
