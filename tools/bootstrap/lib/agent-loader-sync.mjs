/**
 * [REQ-TIED_AGENT_LOADER_REFRESH] [IMPL-TIED_AGENT_LOADER_REFRESH] [ARCH-TIED_AGENT_LOADER_REFRESH]
 * How: SYNC_AGENTS_MD — semver-driven client AGENTS.md sync from store template.
 */
import fs from "node:fs";
import path from "node:path";
import { manifestPaths } from "./constants.mjs";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { sayWarn, sayOk } from "./console.mjs";
import {
  readAgentsSemverFromFile,
  readStoreMethodologySemver,
} from "./store-methodology-version.mjs";
import { readInstallManifest } from "./layers/install-manifest.mjs";

const AGENTS_FILENAME = "AGENTS.md";

function resolveTemplateFile(templatesDir, storeRoot, filename) {
  const fromTemplates = path.join(templatesDir, filename);
  if (fs.existsSync(fromTemplates)) return fromTemplates;
  return path.join(storeRoot, filename);
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {-1 | 0 | 1 | null}
 */
export function compareSemverTuple(a, b) {
  if (!a || !b) return null;
  const parse = (v) => {
    const parts = v.split(".").map((n) => Number.parseInt(n, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    return parts;
  };
  const ta = parse(a);
  const tb = parse(b);
  if (!ta || !tb) return null;
  for (let i = 0; i < 3; i += 1) {
    if (ta[i] < tb[i]) return -1;
    if (ta[i] > tb[i]) return 1;
  }
  return 0;
}

/**
 * @param {string} projectRoot
 * @param {string} storeRoot
 * @param {{ preserveAgentLoader?: boolean }} [options]
 */
export function syncAgentsMd(projectRoot, storeRoot, options = {}) {
  const preserve = options.preserveAgentLoader === true;
  const paths = manifestPaths();
  const dest = path.join(projectRoot, AGENTS_FILENAME);
  const storeSemver = readStoreMethodologySemver(storeRoot);

  if (storeSemver === "unknown") {
    return { action: "skipped", reason: "store_semver_unknown" };
  }

  const src = resolveTemplateFile(paths.templatesDir, storeRoot, AGENTS_FILENAME);
  if (!fs.existsSync(src)) {
    throw new Error(`MISSING_TEMPLATE_SOURCE: ${src}`);
  }

  if (!fs.existsSync(dest)) {
    copyFileWithAttributes(src, dest);
    sayOk(`Wrote ${dest} from TIED store (create-if-absent).`);
    return { action: "created", reason: "missing", storeSemver };
  }

  if (preserve) {
    return { action: "skipped", reason: "preserve", storeSemver };
  }

  const clientSemver = readAgentsSemverFromFile(dest);
  if (!clientSemver) {
    copyFileWithAttributes(src, dest);
    sayOk(`Refreshed ${dest} from TIED store (unparseable client semver).`);
    return { action: "updated", reason: "client_semver_unparseable", storeSemver };
  }

  const cmp = compareSemverTuple(clientSemver, storeSemver);
  if (cmp === null) {
    copyFileWithAttributes(src, dest);
    return { action: "updated", reason: "compare_failed", storeSemver, clientSemver };
  }
  if (cmp < 0) {
    copyFileWithAttributes(src, dest);
    sayOk(`Refreshed ${dest} from TIED store (${clientSemver} → ${storeSemver}).`);
    return { action: "updated", reason: "client_behind_store", storeSemver, clientSemver };
  }
  if (cmp > 0) {
    sayWarn(
      `DIAGNOSTIC: Client AGENTS.md semver ${clientSemver} is ahead of store ${storeSemver}; loader not overwritten.`,
    );
    return { action: "skipped", reason: "client_newer", storeSemver, clientSemver };
  }
  return { action: "skipped", reason: "equal", storeSemver, clientSemver };
}

/**
 * PRE: install manifest may exist after writeInstallManifest.
 * POST: WARN when AGENTS semver disagrees with install.json pin.
 * @param {string} projectRoot
 */
export function warnAgentsLoaderDrift(projectRoot) {
  const manifest = readInstallManifest(projectRoot);
  const pin = manifest?.store_methodology_version;
  if (!pin || pin === "unknown") {
    return { drift: false };
  }
  const agentsPath = path.join(projectRoot, AGENTS_FILENAME);
  if (!fs.existsSync(agentsPath)) {
    return { drift: false };
  }
  const clientSemver = readAgentsSemverFromFile(agentsPath);
  if (!clientSemver) {
    sayWarn(
      `DIAGNOSTIC: AGENTS.md has no parseable TIED Methodology Version; install.json pin is ${pin}. Re-run tied-install --refresh or merge loader manually.`,
    );
    return { drift: true, pin, clientSemver: null };
  }
  if (clientSemver !== pin) {
    sayWarn(
      `DIAGNOSTIC: AGENTS.md semver ${clientSemver} differs from install.json store_methodology_version ${pin}. Re-run tied-install --refresh (omit --preserve-agent-loader) or use --preserve-agent-loader if intentional.`,
    );
    return { drift: true, pin, clientSemver };
  }
  return { drift: false, pin, clientSemver };
}
