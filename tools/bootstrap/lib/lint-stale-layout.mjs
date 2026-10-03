/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: LINT_STALE_LAYOUT_REFERENCES — fail-closed scan of live surfaces for pre-two-folder paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isAllowlistedStaleHit } from "./stale-layout-allowlist.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(__dirname, "../../..");

/** @type {readonly { id: string, re: RegExp, hint: string }[]} */
export const STALE_LAYOUT_PATTERNS = [
  { id: "tied_docs", re: /tied\/docs\//, hint: "use tied-bundle/docs/" },
  { id: "tied_methodology", re: /tied\/methodology/, hint: "use tied-bundle/" },
  { id: "tied_install_json", re: /tied\/\.tied-install\.json/, hint: "use tied-bundle/install.json" },
  {
    id: "linked_methodology_view",
    re: /tied\/\.linked-methodology-view/,
    hint: "removed; client tied-bundle/ is bundle root",
  },
  { id: "legacy_tied_yaml", re: /\.tied-yaml\.yaml/, hint: "use tied-project/config.yaml" },
  { id: "dot_tied_dir", re: /(?:^|[\s`'"(])\.tied\//, hint: "reports live under tied-bundle/reports/" },
  {
    id: "root_templates",
    re: /(?:^|[\s`'"(])templates\//,
    hint: "store corpus is tied-bundle/; not root templates/",
  },
  { id: "copy_files", re: /copy_files/, hint: "use tied-install" },
  { id: "copy_files_mjs", re: /copy-files\.mjs/, hint: "removed; use install-layers.mjs" },
  { id: "legacy_bootstrap_flag", re: /--legacy-bootstrap/, hint: "removed; use --mode full" },
  { id: "legacy_bootstrap_env", re: /TIED_BOOTSTRAP_LEGACY/, hint: "removed" },
];

/** @type {readonly string[]} */
export const LIVE_SURFACE_ROOTS = [
  "AGENTS.md",
  ".cursorrules",
  "README.md",
  "tools",
  "scripts",
  "mcp-server/src",
  "mcp-server/packages",
  "mcp-server/test",
  "tied-bundle/templates",
  "tied-project/vocab",
  "tied-project/requirements.yaml",
  "tied-project/architecture-decisions.yaml",
  "tied-project/implementation-decisions.yaml",
  "tied-project/semantic-tokens.yaml",
  "tied-project/requirements",
  "tied-project/architecture-decisions",
  "tied-project/implementation-decisions",
  ".github",
];

const SKIP_DIR = new Set(["node_modules", "dist", ".git"]);
const SKIP_PATH_RE =
  /(?:^|\/)(?:tied-project\/working\/|tied-project\/citdp\/|tied-bundle\/working\/|mcp-server\/methodology-bundle\/corpus\/)/;

/**
 * @param {string} rel from repo root, posix
 */
function shouldScanFile(rel) {
  if (SKIP_PATH_RE.test(rel)) return false;
  if (rel === "CHANGELOG.md" || rel.startsWith("docs/")) return false;
  const ext = path.extname(rel);
  return [
    ".md",
    ".yaml",
    ".yml",
    ".json",
    ".sh",
    ".cmd",
    ".ps1",
    ".mjs",
    ".ts",
    ".tsx",
    ".js",
    ".rb",
  ].includes(ext);
}

/**
 * @param {string} dir
 * @param {string} repoRoot
 * @param {string[]} acc
 */
function walk(dir, repoRoot, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const abs = path.join(dir, name);
    const rel = path.relative(repoRoot, abs).replace(/\\/g, "/");
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walk(abs, repoRoot, acc);
      continue;
    }
    if (shouldScanFile(rel)) acc.push(rel);
  }
}

/**
 * @param {string} repoRoot
 * @param {{ roots?: readonly string[] }} [opts]
 * @returns {{ ok: boolean, findings: { file: string, line: number, patternId: string, hint: string, excerpt: string }[] }}
 */
export function lintStaleLayoutReferences(repoRoot, opts = {}) {
  const root = path.resolve(repoRoot);
  const roots = opts.roots ?? LIVE_SURFACE_ROOTS;
  /** @type {string[]} */
  const files = [];
  for (const rel of roots) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    if (fs.statSync(abs).isFile()) {
      if (shouldScanFile(rel)) files.push(rel);
    } else {
      walk(abs, root, files);
    }
  }

  /** @type {ReturnType<typeof lintStaleLayoutReferences>["findings"]} */
  const findings = [];
  for (const rel of [...new Set(files)].sort()) {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (rel.includes("tied-project/working/") || rel.includes("tied-bundle/templates/")) {
        // committed working paths are ok in envelope examples when under tied-project/working
      }
      if (rel.startsWith("tied-project/") && line.includes("tied-project/working/")) {
        continue;
      }
      if (rel.startsWith("tied-bundle/") && line.includes("tied-bundle/working/")) {
        continue;
      }
      for (const pat of STALE_LAYOUT_PATTERNS) {
        if (!pat.re.test(line)) continue;
        if (pat.id === "root_templates" && line.includes("tied-bundle/templates/")) continue;
        if (isAllowlistedStaleHit(rel, pat.id)) continue;
        findings.push({
          file: rel,
          line: i + 1,
          patternId: pat.id,
          hint: pat.hint,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  }
  return { ok: findings.length === 0, findings };
}

/**
 * @param {string} [repoRoot]
 * @returns {number} exit code
 */
export function runStaleLayoutLintCli(repoRoot = DEFAULT_REPO_ROOT) {
  const result = lintStaleLayoutReferences(repoRoot);
  if (!result.ok) {
    for (const f of result.findings) {
      console.error(`${f.file}:${f.line}: [${f.patternId}] ${f.hint}`);
      console.error(`  ${f.excerpt}`);
    }
    console.error(`DEBUG: lint-stale-layout: ${result.findings.length} finding(s)`);
    return 1;
  }
  console.log("DEBUG: lint-stale-layout: ok (0 findings on live surfaces)");
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_REPO_ROOT;
  process.exit(runStaleLayoutLintCli(repoRoot));
}
