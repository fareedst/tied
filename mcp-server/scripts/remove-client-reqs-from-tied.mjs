/**
 * One-shot: remove client-project REQ/ARCH/IMPL tokens mistakenly merged into project TIED.
 * Run from repo root: node mcp-server/scripts/remove-client-reqs-from-tied.mjs
 * Then: lint_yaml on touched tied/*.yaml; tied_validate_consistency.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const tied = path.join(repoRoot, "tied");

const RUBY_TOKENS = new Set([
  "REQ-RUBY_INT_MULTIPLY",
  "REQ-RUBY_INT_FOUR_INT_MULTIPLY",
  "ARCH-RUBY_INT_MULTIPLY",
  "ARCH-RUBY_INT_FOUR_INT_MULTIPLY",
  "IMPL-RUBY_INT_MULTIPLY",
  "IMPL-RUBY_INT_FOUR_INT_MULTIPLY",
]);

const CRSRBRW_TOKENS = new Set([
  "REQ-CRSRBRW_MAIN_LIST",
  "ARCH-CRSRBRW_MAIN_LIST",
  "IMPL-CRSRBRW_MAIN_LIST",
]);

/** @param {string} k */
function shouldRemoveToken(k) {
  if (k.startsWith("REQ-TREEGREP")) return true;
  if (k.startsWith("ARCH-TREEGREP")) return true;
  if (k.startsWith("IMPL-TREEGREP")) return true;
  if (RUBY_TOKENS.has(k)) return true;
  if (CRSRBRW_TOKENS.has(k)) return true;
  return false;
}

function load(p) {
  return yaml.load(fs.readFileSync(p, "utf8"));
}
function dump(obj) {
  return yaml.dump(obj, { lineWidth: -1, noRefs: true });
}

function stripIndex(indexPath) {
  const idx = load(indexPath);
  if (!idx || typeof idx !== "object") throw new Error(`Bad index: ${indexPath}`);
  let removed = 0;
  for (const k of Object.keys(idx)) {
    if (shouldRemoveToken(k)) {
      delete idx[k];
      removed++;
    }
  }
  fs.writeFileSync(indexPath, dump(idx));
  console.log(`DEBUG: ${path.relative(repoRoot, indexPath)} removed ${removed} keys`);
  return removed;
}

function deleteDetailFiles(subdir) {
  const dir = path.join(tied, subdir);
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".yaml")) continue;
    const stem = name.slice(0, -".yaml".length);
    if (shouldRemoveToken(stem)) {
      fs.unlinkSync(path.join(dir, name));
      n++;
    }
  }
  console.log(`DEBUG: ${subdir} deleted ${n} detail files`);
  return n;
}

const indexes = [
  "requirements.yaml",
  "architecture-decisions.yaml",
  "implementation-decisions.yaml",
  "semantic-tokens.yaml",
];

let totalKeys = 0;
for (const f of indexes) {
  totalKeys += stripIndex(path.join(tied, f));
}
let totalFiles = 0;
totalFiles += deleteDetailFiles("requirements");
totalFiles += deleteDetailFiles("architecture-decisions");
totalFiles += deleteDetailFiles("implementation-decisions");

console.log(
  `TRACE: Done. Index keys removed: ${totalKeys}, detail files deleted: ${totalFiles}`
);
