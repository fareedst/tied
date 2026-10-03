/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Single source of truth for two-folder TIED path constants and resolution.
 */
import fs from "node:fs";
import path from "node:path";

/** @type {readonly string} */
export const PROJECT_DIR_NAME = "tied-project";
/** @type {readonly string} */
export const BUNDLE_DIR_NAME = "tied-bundle";
/** @type {readonly string} */
export const LEGACY_PROJECT_DIR_NAME = "tied";

/** Store-side bundle root segment (committed in TIED source repo). */
export const STORE_BUNDLE_DIR_NAME = BUNDLE_DIR_NAME;

/**
 * @typedef {object} TiedLayout
 * @property {string} projectRoot
 * @property {string} tiedDir Absolute project traceability root (tied-project/)
 * @property {string} bundleDir Absolute bundle root (tied-bundle/)
 * @property {string} projectConfigPath tied-project/config.yaml
 * @property {string} installConfigPath tied-bundle/install.json
 * @property {string} methodologyIndexRoot Flattened methodology indexes at bundle root
 * @property {string} docsDir tied-bundle/docs
 * @property {string} methodVocabDir tied-bundle/vocab
 * @property {string} templatesDir tied-bundle/templates
 * @property {string} workingCommittedRoot tied-project/working
 * @property {string} workingLocalRoot tied-bundle/working
 * @property {string} reportsDir tied-bundle/reports
 * @property {boolean} legacyProjectDir True when resolved via legacy `tied/` name (pre-migration)
 */

/**
 * Resolve which on-disk project directory name exists.
 * @param {string} projectRoot
 * @returns {{ dirName: string, legacy: boolean }}
 */
export function resolveProjectDirName(projectRoot) {
  const modern = path.join(projectRoot, PROJECT_DIR_NAME);
  const legacy = path.join(projectRoot, LEGACY_PROJECT_DIR_NAME);
  if (fs.existsSync(modern)) {
    return { dirName: PROJECT_DIR_NAME, legacy: false };
  }
  if (fs.existsSync(legacy)) {
    return { dirName: LEGACY_PROJECT_DIR_NAME, legacy: true };
  }
  return { dirName: PROJECT_DIR_NAME, legacy: false };
}

/**
 * @param {string} projectRoot
 * @returns {TiedLayout}
 */
export function resolveTiedLayout(projectRoot) {
  const root = path.resolve(projectRoot);
  const { dirName, legacy } = resolveProjectDirName(root);
  const tiedDir = path.join(root, dirName);
  const bundleDir = path.join(root, BUNDLE_DIR_NAME);

  return {
    projectRoot: root,
    tiedDir,
    bundleDir,
    projectConfigPath: path.join(tiedDir, "config.yaml"),
    installConfigPath: path.join(bundleDir, "install.json"),
    methodologyIndexRoot: bundleDir,
    docsDir: path.join(bundleDir, "docs"),
    methodVocabDir: path.join(bundleDir, "vocab"),
    templatesDir: path.join(bundleDir, "templates"),
    workingCommittedRoot: path.join(tiedDir, "working"),
    workingLocalRoot: path.join(bundleDir, "working"),
    reportsDir: path.join(bundleDir, "reports"),
    legacyProjectDir: legacy,
  };
}

/**
 * Store checkout layout (methodology corpus under tied-bundle/, store vocab under tied-project|tied).
 * @param {string} storeRoot
 */
export function resolveStoreLayout(storeRoot) {
  const root = path.resolve(storeRoot);
  const layout = resolveTiedLayout(root);
  return {
    ...layout,
    storeVocabDir: path.join(layout.tiedDir, "vocab"),
    bundledMethodologyCorpus: path.join(root, "mcp-server", "methodology-bundle", "corpus"),
  };
}

/** Legacy markers that must not exist after install/migrate (SC-TFL-NO-LEGACY-TIED-DIR). */
export const LEGACY_LAYOUT_MARKERS = [
  (root) => path.join(root, LEGACY_PROJECT_DIR_NAME),
  (root) => path.join(root, LEGACY_PROJECT_DIR_NAME, "docs"),
  (root) => path.join(root, LEGACY_PROJECT_DIR_NAME, "methodology"),
  (root) => path.join(root, LEGACY_PROJECT_DIR_NAME, ".tied-install.json"),
  (root) => path.join(root, LEGACY_PROJECT_DIR_NAME, ".linked-methodology-view"),
  (root) => path.join(root, ".tied-yaml.yaml"),
  (root) => path.join(root, ".tied"),
  (root) => path.join(root, "templates"),
];

/**
 * @param {string} projectRoot
 * @param {{ allowLegacyProjectDir?: boolean }} [opts]
 * @returns {{ detected: false } | { detected: true, code: string, hint: string, paths: string[] }}
 */
export function detectLegacyLayout(projectRoot, opts = {}) {
  const root = path.resolve(projectRoot);
  const paths = [];
  const { dirName } = resolveProjectDirName(root);

  if (dirName === LEGACY_PROJECT_DIR_NAME && !opts.allowLegacyProjectDir) {
    paths.push(path.join(root, LEGACY_PROJECT_DIR_NAME));
  }

  for (const marker of LEGACY_LAYOUT_MARKERS) {
    const p = marker(root);
    if (p.endsWith(LEGACY_PROJECT_DIR_NAME) && opts.allowLegacyProjectDir) {
      continue;
    }
    if (fs.existsSync(p)) {
      paths.push(p);
    }
  }

  if (paths.length === 0) {
    return { detected: false };
  }
  return {
    detected: true,
    code: "LEGACY_LAYOUT_DETECTED",
    hint: "Run tied-install --migrate-layout from the project root.",
    paths: [...new Set(paths)],
  };
}

/**
 * @param {string} projectRoot
 * @param {string} storeRoot
 * @param {{ allow?: boolean }} [opts]
 */
export function guardSelfInstall(projectRoot, storeRoot, opts = {}) {
  if (opts.allow === true) {
    return;
  }
  const project = path.resolve(projectRoot);
  const store = path.resolve(storeRoot);
  if (project === store) {
    const err = new Error("SELF_INSTALL_REFUSED");
    err.code = "SELF_INSTALL_REFUSED";
    throw err;
  }
  const rel = path.relative(store, project);
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) {
    const err = new Error("SELF_INSTALL_REFUSED");
    err.code = "SELF_INSTALL_REFUSED";
    throw err;
  }
  const relInv = path.relative(project, store);
  if (relInv && !relInv.startsWith("..") && !path.isAbsolute(relInv)) {
    const err = new Error("SELF_INSTALL_REFUSED");
    err.code = "SELF_INSTALL_REFUSED";
    throw err;
  }
}

/**
 * @param {string} projectRoot
 * @param {string} requestToken e.g. REQ-TIED_FOO
 * @param {"committed"|"local"} kind
 */
export function resolveWorkingRoot(projectRoot, requestToken, kind) {
  const layout = resolveTiedLayout(projectRoot);
  const base =
    kind === "committed" ? layout.workingCommittedRoot : layout.workingLocalRoot;
  return path.join(base, requestToken);
}
