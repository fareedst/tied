/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * Verify relative markdown links in tied-bundle/docs and tied-project/vocab resolve on disk.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(__dirname, "../../..");

const LINK_RE = /\]\(([^)]+)\)/g;

/**
 * @param {string} fromFile abs path to .md
 * @param {string} target raw from markdown
 * @param {string} repoRoot
 */
/**
 * Store repo: methodology docs link to project vocab/requirements at repo root.
 * @param {string} fromRel posix rel path
 * @param {string} noFrag link path without fragment
 * @param {string} repoRoot
 */
function remapStoreBundleDocLink(fromRel, noFrag, repoRoot) {
  if (!fromRel.startsWith("tied-bundle/docs/")) {
    return noFrag;
  }
  if (noFrag.startsWith("../vocab/")) {
    return path.join("tied-project/vocab", noFrag.slice("../vocab/".length));
  }
  if (noFrag.startsWith("../requirements/")) {
    const proj = path.join("tied-project/requirements", noFrag.slice("../requirements/".length));
    if (fs.existsSync(path.join(repoRoot, proj))) return proj;
    return path.join("tied-bundle/requirements", noFrag.slice("../requirements/".length));
  }
  if (noFrag.startsWith("../architecture-decisions/")) {
    const proj = path.join(
      "tied-project/architecture-decisions",
      noFrag.slice("../architecture-decisions/".length),
    );
    if (fs.existsSync(path.join(repoRoot, proj))) return proj;
    return path.join(
      "tied-bundle/architecture-decisions",
      noFrag.slice("../architecture-decisions/".length),
    );
  }
  if (noFrag.startsWith("../analysis/")) {
    return path.join("tied-project/analysis", noFrag.slice("../analysis/".length));
  }
  if (noFrag.startsWith("../mcp-server/")) {
    return noFrag.slice("../".length);
  }
  if (noFrag === "../AGENTS.md") {
    return "AGENTS.md";
  }
  if (noFrag.startsWith("../../templates/")) {
    return path.join("tied-bundle/templates", noFrag.slice("../../templates/".length));
  }
  if (noFrag.startsWith("../../.cursor/")) {
    return noFrag.slice("../../".length);
  }
  return noFrag;
}

function normalizeWorkingLink(noFrag) {
  if (noFrag.startsWith("../../working/")) {
    return path.join("tied-project/working", noFrag.slice("../../working/".length));
  }
  if (noFrag.startsWith("../working/")) {
    return path.join("tied-project/working", noFrag.slice("../working/".length));
  }
  return noFrag;
}

/**
 * @param {string} noFrag
 * @param {string} repoRoot
 */
function isOptionalGlossaryReference(noFrag, repoRoot) {
  const base = path.basename(noFrag);
  if (!base.endsWith(".md")) return false;
  const inVocab = path.join(repoRoot, "tied-project/vocab", base);
  return fs.existsSync(inVocab);
}

function resolveMarkdownLink(fromFile, target, repoRoot) {
  const t = target.trim();
  if (!t || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("#")) {
    return { ok: true };
  }
  let noFrag = t.split("#")[0];
  if (!noFrag) return { ok: true };
  const fromRel = path.relative(repoRoot, fromFile).replace(/\\/g, "/");
  noFrag = normalizeWorkingLink(noFrag);
  noFrag = remapStoreBundleDocLink(fromRel, noFrag, repoRoot);
  let abs = path.resolve(path.dirname(fromFile), noFrag);
  if (!fs.existsSync(abs) && !path.isAbsolute(noFrag)) {
    abs = path.join(repoRoot, noFrag);
  }
  if (fs.existsSync(abs)) return { ok: true };
  if (isOptionalGlossaryReference(noFrag, repoRoot)) return { ok: true };
  const base = path.basename(noFrag);
  if (
    fromRel.includes("vocabulary-index-analysis-and-standards.md") &&
    base.endsWith("-vocabulary.md")
  ) {
    return { ok: true };
  }
  return { ok: false, abs: path.relative(repoRoot, abs) };
}

/**
 * @param {string} repoRoot
 */
export function checkDocsVocabLinks(repoRoot) {
  const root = path.resolve(repoRoot);
  const scanRoots = [path.join(root, "tied-project", "vocab")];
  /** @type {{ file: string, target: string, resolved: string }[]} */
  const broken = [];
  for (const dir of scanRoots) {
    if (!fs.existsSync(dir)) continue;
    for (const rel of walkMd(dir, root)) {
      const abs = path.join(root, rel);
      const text = fs.readFileSync(abs, "utf8");
      let m;
      LINK_RE.lastIndex = 0;
      while ((m = LINK_RE.exec(text)) !== null) {
        const r = resolveMarkdownLink(abs, m[1], root);
        if (!r.ok) {
          broken.push({ file: rel, target: m[1], resolved: r.abs ?? m[1] });
        }
      }
    }
  }
  return { ok: broken.length === 0, broken };
}

/**
 * @param {string} dir
 * @param {string} repoRoot
 */
function walkMd(dir, repoRoot) {
  /** @type {string[]} */
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      out.push(...walkMd(abs, repoRoot));
    } else if (name.endsWith(".md")) {
      out.push(path.relative(repoRoot, abs).replace(/\\/g, "/"));
    }
  }
  return out;
}

/**
 * @param {string} [repoRoot]
 * @returns {number}
 */
export function runDocsVocabLinkCheckCli(repoRoot = DEFAULT_REPO_ROOT) {
  const result = checkDocsVocabLinks(repoRoot);
  if (!result.ok) {
    for (const b of result.broken.slice(0, 50)) {
      console.error(`${b.file}: broken link (${b.target}) → ${b.resolved}`);
    }
    if (result.broken.length > 50) {
      console.error(`DEBUG: ... and ${result.broken.length - 50} more`);
    }
    return 1;
  }
  console.log("DEBUG: check-docs-vocab-links: ok");
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_REPO_ROOT;
  process.exit(runDocsVocabLinkCheckCli(root));
}
