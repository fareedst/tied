/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Mechanical path rewrites for store self-migration (plan phase 6 live surfaces).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

/** @type {readonly { from: string, to: string }[]} Order matters — longer/specific paths first. */
export const REWRITE_PAIRS = [
  { from: "tied-bundle/vocab/", to: "tied-bundle/vocab/" },
  { from: "tied-bundle/", to: "tied-bundle/" },
  { from: "tied-bundle/docs/", to: "tied-bundle/docs/" },
  { from: "tied-install.sh", to: "tied-install.sh" },
  { from: "tied-install.cmd", to: "tied-install.cmd" },
  { from: "tied-install.ps1", to: "tied-install.ps1" },
  { from: "tied-project/config.yaml", to: "tied-project/config.yaml" },
  { from: "tied-project/working/", to: "tied-project/working/" },
  { from: "tied-project/config.yaml", to: "tied-project/config.yaml" },
  { from: "tied-project/citdp/", to: "tied-project/citdp/" },
  { from: "tied-project/vocab/", to: "tied-project/vocab/" },
  { from: "tied-project/requirements/", to: "tied-project/requirements/" },
  { from: "tied-project/architecture-decisions/", to: "tied-project/architecture-decisions/" },
  { from: "tied-project/implementation-decisions/", to: "tied-project/implementation-decisions/" },
  { from: "tied-project/requirements.yaml", to: "tied-project/requirements.yaml" },
  { from: "tied-project/architecture-decisions.yaml", to: "tied-project/architecture-decisions.yaml" },
  { from: "tied-project/implementation-decisions.yaml", to: "tied-project/implementation-decisions.yaml" },
  { from: "tied-project/semantic-tokens.yaml", to: "tied-project/semantic-tokens.yaml" },
  { from: "`tied-project/` directory", to: "`tied-project/` directory" },
  { from: "the **`tied-project/`** directory", to: "the **`tied-project/`** directory" },
  { from: "path to that project’s `tied-project/`", to: "path to that project’s `tied-project/`" },
  { from: "path to that project's `tied-project/`", to: "path to that project's `tied-project/`" },
  { from: "/tied\"", to: "/tied-project\"" },
  { from: "TIED_BASE_PATH=/Users/fareed/Documents/dev/chatgpt/stdd/tied-project-project", to: "TIED_BASE_PATH=/Users/fareed/Documents/dev/chatgpt/stdd/tied-project-project" },
  { from: "**`tied-bundle/`** in the TIED repository", to: "**`tied-bundle/`** in the TIED repository" },
  { from: "under **`tied-bundle/`**", to: "under **`tied-bundle/`** (methodology corpus)" },
  { from: "lives under `tied-bundle/`", to: "lives under `tied-bundle/`" },
  { from: "Re-run `tied-install.sh`", to: "Re-run `tied-install --refresh`" },
  { from: "via `tied-install.sh`", to: "via `tied-install`" },
  { from: "after `tied-install.sh`", to: "after `tied-install`" },
  { from: "what `tied-install.sh` installs", to: "what `tied-install` installs" },
  { from: "what `tied-install.sh` copies", to: "what `tied-install` materializes" },
  { from: "from TIED `tied-bundle/`", to: "from TIED `tied-bundle/`" },
  { from: "from `tied-bundle/`", to: "from `tied-bundle/`" },
  { from: "store `tied-bundle/`", to: "store `tied-bundle/`" },
];

const SKIP_DIR_NAMES = new Set(["node_modules", "dist", ".git", "working"]);
const SKIP_PATH_PARTS = [
  "/tied-project/working/",
  "/tied-project/citdp/",
  "/CHANGELOG.md",
  "/docs/comparisons/",
  "/docs/methodologies/",
];

/**
 * @param {string} text
 */
export function rewriteTwoFolderPaths(text) {
  let out = text;
  for (const { from, to } of REWRITE_PAIRS) {
    out = out.split(from).join(to);
  }
  return out;
}

/**
 * @param {string} absPath
 */
function shouldProcessFile(absPath) {
  const rel = path.relative(REPO_ROOT, absPath).replace(/\\/g, "/");
  if (rel.startsWith("docs/") && !rel.startsWith("tied-bundle/docs/")) {
    return false;
  }
  for (const part of SKIP_PATH_PARTS) {
    if (rel.includes(part.replace(/^\//, ""))) {
      return false;
    }
  }
  return true;
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walk(abs, acc);
      continue;
    }
    if (!shouldProcessFile(abs)) continue;
    const ext = path.extname(name);
    if (![".md", ".yaml", ".yml", ".json", ".sh", ".cmd", ".ps1", ".mjs", ".ts", ".tsx", ".js", ".rb"].includes(ext)) {
      continue;
    }
    acc.push(abs);
  }
}

/**
 * @param {string} root
 * @param {readonly string[]} relDirs
 */
export function rewriteLiveSurfaces(root, relDirs) {
  /** @type {{ path: string, changed: boolean }[]} */
  const results = [];
  for (const rel of relDirs) {
    const absDir = path.join(root, rel);
    if (!fs.existsSync(absDir)) continue;
    /** @type {string[]} */
    const files = [];
    if (fs.statSync(absDir).isFile()) {
      files.push(absDir);
    } else {
      walk(absDir, files);
    }
    for (const file of files) {
      if (!shouldProcessFile(file)) continue;
      const before = fs.readFileSync(file, "utf8");
      const after = rewriteTwoFolderPaths(before);
      if (after !== before) {
        fs.writeFileSync(file, after);
        results.push({ path: path.relative(root, file), changed: true });
      }
    }
  }
  return results;
}

/**
 * @param {string} root
 */
export function rewriteProjectVocabLinks(root) {
  const vocabDir = path.join(root, "tied-project", "vocab");
  if (!fs.existsSync(vocabDir)) return [];
  /** @type {string[]} */
  const changed = [];
  for (const name of fs.readdirSync(vocabDir)) {
    if (!name.endsWith(".md")) continue;
    const file = path.join(vocabDir, name);
    const before = fs.readFileSync(file, "utf8");
    const after = before.replace(/\]\(\.\.\/docs\//g, "](../../tied-bundle/docs/");
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed.push(path.relative(root, file));
    }
  }
  return changed;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    console.error("Usage: node rewrite-two-folder-paths.mjs <rel-dir>...");
    process.exit(1);
  }
  const changed = rewriteLiveSurfaces(REPO_ROOT, dirs);
  const vocab = rewriteProjectVocabLinks(REPO_ROOT);
  for (const p of [...changed.map((c) => c.path), ...vocab]) {
    console.log(p);
  }
  console.error(`DEBUG: rewrite-two-folder-paths changed ${changed.length + vocab.length} files`);
}
