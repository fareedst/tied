#!/usr/bin/env node
/**
 * [IMPL-TIED_PROJECT_INDEX_WRITE_ISOLATION] [ARCH-TIED_PROJECT_INDEX_WRITE_ISOLATION] [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]
 * Remove project index rows that are identical copies of inherited methodology rows (pollution).
 * Preserves override rows that differ from methodology. Default: --dry-run.
 *
 * Usage:
 *   node scripts/prune-project-index-methodology-duplicates.mjs [--write] [client-root-or-tied-project]
 *
 * Environment (optional):
 *   TIED_BASE_PATH              — absolute path to tied-project/ (writable indexes)
 *   TIED_METHODOLOGY_BUNDLE_PATH — absolute path to tied-bundle/ (methodology indexes)
 *
 * If a positional path is given, it wins over unset TIED_BASE_PATH:
 *   .../my-client          → tied-project under that root
 *   .../my-client/tied-project
 *   .../my-client/tied-bundle (uses parent as client root)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

async function loadCanonicalWriter(repoRoot) {
  const modPath = path.join(repoRoot, "mcp-server/dist/yaml-canonicalizer.js");
  if (!fs.existsSync(modPath)) {
    throw new Error(
      `DIAGNOSTIC: built canonicalizer missing at ${modPath}; run npm run build --prefix mcp-server`,
    );
  }
  return import(pathToFileURL(modPath).href);
}

const INDEX_FILES = {
  requirements: "requirements.yaml",
  architecture: "architecture-decisions.yaml",
  implementation: "implementation-decisions.yaml",
  "semantic-tokens": "semantic-tokens.yaml",
};

function loadYaml(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = yaml.load(fs.readFileSync(filePath, "utf8"));
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return null;
}

function resolveClientRootFromArg(argPath) {
  const resolved = path.resolve(argPath);
  const base = path.basename(resolved);
  if (base === "tied-project") return path.dirname(resolved);
  if (base === "tied-bundle") return path.dirname(resolved);
  return resolved;
}

function resolveRoots() {
  const flags = new Set(["--write", "--dry-run", "-h", "--help"]);
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("-") && !flags.has(a));

  let base;
  let bundle;

  if (process.env.TIED_BASE_PATH?.trim()) {
    base = path.resolve(process.env.TIED_BASE_PATH.trim());
  }

  if (positional.length > 0) {
    const clientRoot = resolveClientRootFromArg(positional[0]);
    base = path.join(clientRoot, "tied-project");
    if (!process.env.TIED_METHODOLOGY_BUNDLE_PATH?.trim()) {
      bundle = path.join(clientRoot, "tied-bundle");
    }
  }

  if (!base) {
    base = path.join(process.cwd(), "tied-project");
  }

  if (!bundle) {
    const projectRoot = path.dirname(base);
    bundle =
      process.env.TIED_METHODOLOGY_BUNDLE_PATH?.trim() ||
      path.join(projectRoot, "tied-bundle");
    if (process.env.TIED_METHODOLOGY_BUNDLE_PATH?.trim()) {
      bundle = path.resolve(bundle);
    }
  }

  return { base: path.resolve(base), bundle: path.resolve(bundle) };
}

function payloadsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pruneIndex(name, base, bundle, write, writeCanonicalValueAtomic) {
  const projPath = path.join(base, INDEX_FILES[name]);
  const methPath = path.join(bundle, INDEX_FILES[name]);
  const proj = loadYaml(projPath);
  const meth = loadYaml(methPath);
  if (!proj || !meth) {
    const missing = [];
    if (!proj) missing.push(`project:${projPath}`);
    if (!meth) missing.push(`methodology:${methPath}`);
    return { removed: [], skipped: `missing_index (${missing.join(", ")})` };
  }

  const removed = [];
  for (const token of Object.keys(proj)) {
    if (token.startsWith("#")) continue;
    if (!(token in meth)) continue;
    const pVal = proj[token];
    const mVal = meth[token];
    if (typeof pVal !== "object" || pVal === null) continue;
    if (typeof mVal !== "object" || mVal === null) continue;
    if (payloadsEqual(pVal, mVal)) {
      removed.push(token);
      delete proj[token];
    }
  }

  if (write && removed.length > 0) {
    const result = writeCanonicalValueAtomic(projPath, proj);
    if (!result.ok) {
      throw new Error(`DIAGNOSTIC: canonical write failed for ${projPath}: ${result.error}`);
    }
  }
  return { removed, skipped: null };
}

if (process.argv.includes("-h") || process.argv.includes("--help")) {
  console.log(`Usage: node scripts/prune-project-index-methodology-duplicates.mjs [--write] [client-root-or-tied-project]

Default is --dry-run (no file changes). Set TIED_BASE_PATH or pass the client path as the last argument.`);
  process.exit(0);
}

const write = process.argv.includes("--write");
const { base, bundle } = resolveRoots();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log(`DEBUG: prune base=${base} bundle=${bundle} write=${write}`);

const { writeCanonicalValueAtomic } = await loadCanonicalWriter(repoRoot);
process.env.TIED_BASE_PATH = base;

if (!fs.existsSync(base)) {
  console.error(
    `DIAGNOSTIC: project index dir missing: ${base}\n` +
      `Set TIED_BASE_PATH to the client's tied-project/ or pass the client root as an argument.`,
  );
  process.exit(2);
}

let totalRemoved = 0;
for (const name of Object.keys(INDEX_FILES)) {
  const result = pruneIndex(name, base, bundle, write, writeCanonicalValueAtomic);
  if (result.skipped) {
    console.log(`TRACE: ${name}: ${result.skipped}`);
    continue;
  }
  totalRemoved += result.removed.length;
  console.log(
    `${write ? "WRITE" : "DRY-RUN"} ${name}: ${write ? "removed" : "would remove"} ${result.removed.length} token(s)`,
  );
  for (const t of result.removed) console.log(`  - ${t}`);
}

if (totalRemoved === 0 && !write) {
  console.log(
    "TRACE: no identical methodology duplicates found in project indexes (or indexes could not be paired).",
  );
}
