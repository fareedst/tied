/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: LOAD_BOOTSTRAP_MANIFEST — single source for DOCS_TO_COPY, skill dirs, verify lists.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveStoreDocsDir,
  resolveStoreMethodologyIndexRoot,
  resolveStoreProjectSourceDir,
  resolveStoreSidecarTemplatePath,
  resolveStoreVocabDir,
} from "./methodology-bundle.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOTSTRAP_ROOT = path.resolve(__dirname, "..");
export const TIED_REPO_ROOT = path.resolve(BOOTSTRAP_ROOT, "../..");

/**
 * [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS]
 * Unix symlink opt-in for `.claude/skills/` requires this true (GATE_SYMLINK_ON_WINDOWS_PROOF).
 * Set true only after green `.github/workflows/windows-bootstrap-smoke.yml` on windows-latest.
 */
export const WINDOWS_COPY_PROVEN_IN_CI = true;

let _manifest = null;

export function loadManifest() {
  if (!_manifest) {
    const raw = fs.readFileSync(path.join(BOOTSTRAP_ROOT, "manifest.json"), "utf8");
    _manifest = JSON.parse(raw);
  }
  return _manifest;
}

export function manifestPaths() {
  const m = loadManifest();
  let methodologyIndexRoot;
  try {
    methodologyIndexRoot = resolveStoreMethodologyIndexRoot(TIED_REPO_ROOT);
  } catch {
    methodologyIndexRoot = path.join(TIED_REPO_ROOT, "templates");
  }
  return {
    templatesDir: methodologyIndexRoot,
    methodologyIndexRoot,
    tiedSourceDir: resolveStoreProjectSourceDir(TIED_REPO_ROOT),
    storeDocsDir: resolveStoreDocsDir(TIED_REPO_ROOT),
    storeSidecarTemplatePath: resolveStoreSidecarTemplatePath(TIED_REPO_ROOT),
    vocabSrc: resolveStoreVocabDir(TIED_REPO_ROOT),
    mcpServerDist: path.join(TIED_REPO_ROOT, "mcp-server", "dist", "index.js"),
    tiedYamlSkillCanonical: path.join(TIED_REPO_ROOT, "tools", "bundled-tied-yaml-skill"),
    tiedYamlSkillDevFallback: path.join(TIED_REPO_ROOT, ".cursor", "skills", "tied-yaml"),
    xlateSkillCanonical: path.join(TIED_REPO_ROOT, "tools", "bundled-xlate-skill"),
    promptTypeSkillsCanonical: path.join(TIED_REPO_ROOT, "tools", "bundled-prompt-type-skills"),
    hooksSource: path.join(TIED_REPO_ROOT, ".cursor", "hooks.json"),
    marker: m.TIED_CLI_REPO_ROOT_MARKER,
    ...m,
  };
}
