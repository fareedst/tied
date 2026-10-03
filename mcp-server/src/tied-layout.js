/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Mirror bootstrap layout constants for MCP path resolution (contract-tested vs layout.mjs).
 */
import fs from "node:fs";
import path from "node:path";
export const PROJECT_DIR_NAME = "tied-project";
export const BUNDLE_DIR_NAME = "tied-bundle";
export const LEGACY_PROJECT_DIR_NAME = "tied";
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
/** Flattened methodology corpus on store checkout (tied-bundle, templates, or legacy tied/methodology). */
export function resolveStoreMethodologySourceDir(repoRoot) {
    const root = path.resolve(repoRoot);
    const bundle = path.join(root, BUNDLE_DIR_NAME);
    if (fs.existsSync(path.join(bundle, "requirements.yaml"))) {
        return bundle;
    }
    const live = path.join(root, LEGACY_PROJECT_DIR_NAME, "methodology");
    if (fs.existsSync(path.join(live, "requirements.yaml"))) {
        return live;
    }
    const templates = path.join(root, "templates");
    if (fs.existsSync(path.join(templates, "requirements.yaml"))) {
        return templates;
    }
    return live;
}
export function detectLegacyLayout(projectRoot, opts = {}) {
    const root = path.resolve(projectRoot);
    const paths = [];
    const { dirName } = resolveProjectDirName(root);
    if (dirName === LEGACY_PROJECT_DIR_NAME && !opts.allowLegacyProjectDir) {
        paths.push(path.join(root, LEGACY_PROJECT_DIR_NAME));
    }
    const markers = [
        (r) => path.join(r, LEGACY_PROJECT_DIR_NAME),
        (r) => path.join(r, LEGACY_PROJECT_DIR_NAME, "docs"),
        (r) => path.join(r, LEGACY_PROJECT_DIR_NAME, "methodology"),
        (r) => path.join(r, "tied-project/config.yaml"),
    ];
    for (const marker of markers) {
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
