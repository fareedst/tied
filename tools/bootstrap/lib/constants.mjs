/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: LOAD_BOOTSTRAP_MANIFEST — single source for DOCS_TO_COPY, skill dirs, verify lists.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOTSTRAP_ROOT = path.resolve(__dirname, "..");
export const TIED_REPO_ROOT = path.resolve(BOOTSTRAP_ROOT, "../..");

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
  return {
    templatesDir: path.join(TIED_REPO_ROOT, "templates"),
    tiedSourceDir: path.join(TIED_REPO_ROOT, "tied"),
    vocabSrc: path.join(TIED_REPO_ROOT, "tied", "vocab"),
    mcpServerDist: path.join(TIED_REPO_ROOT, "mcp-server", "dist", "index.js"),
    tiedYamlSkillCanonical: path.join(TIED_REPO_ROOT, "tools", "bundled-tied-yaml-skill"),
    tiedYamlSkillDevFallback: path.join(TIED_REPO_ROOT, ".cursor", "skills", "tied-yaml"),
    promptTypeSkillsCanonical: path.join(TIED_REPO_ROOT, "tools", "bundled-prompt-type-skills"),
    hooksSource: path.join(TIED_REPO_ROOT, ".cursor", "hooks.json"),
    marker: m.TIED_CLI_REPO_ROOT_MARKER,
    ...m,
  };
}
