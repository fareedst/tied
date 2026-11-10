/**
 * [REQ-TIED_PROJECT_SIZE_LAYERS] Facilitator discover — disposable clients under TIED_TEST_ROOT.
 */
import fs from "node:fs";
import path from "node:path";
import { access, readdir, stat } from "node:fs/promises";

const REQ_YAML = path.join("tied-project", "requirements.yaml");

/** Leading unix-epoch seconds in disposable basename. */
export function parseEpochFromBasename(basename) {
  const m = /^(\d{9,11})(?:-|$)/.exec(basename);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function sanitizeLabelForFilename(label) {
  const safe = String(label)
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const trimmed = safe.slice(0, 120);
  return trimmed.length > 0 ? trimmed : "unnamed";
}

export function basenameMatchesPattern(basename, pattern, patternRegex) {
  if (!pattern) return true;
  if (patternRegex) {
    try {
      return new RegExp(pattern).test(basename);
    } catch {
      return false;
    }
  }
  return basename.includes(pattern);
}

async function isEligibleClient(repoRoot) {
  try {
    await access(path.join(repoRoot, REQ_YAML), fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} line
 * @returns {{ label: string, repo_root: string } | null}
 */
export function parseManifestLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const tab = trimmed.indexOf("\t");
  if (tab >= 0) {
    const label = trimmed.slice(0, tab).trim();
    const repoRoot = trimmed.slice(tab + 1).trim();
    if (!repoRoot) return null;
    return {
      label: label || path.basename(repoRoot),
      repo_root: path.resolve(repoRoot),
    };
  }
  const repoRoot = path.resolve(trimmed);
  return { label: path.basename(repoRoot), repo_root: repoRoot };
}

/**
 * @param {string} manifestPath
 */
export async function loadManifestEntries(manifestPath) {
  const raw = await fs.promises.readFile(manifestPath, "utf8");
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const row = parseManifestLine(line);
    if (row) out.push(row);
  }
  return out;
}

function compareNewestFirst(a, b) {
  const ea = parseEpochFromBasename(a.label);
  const eb = parseEpochFromBasename(b.label);
  if (ea !== null && eb !== null && ea !== eb) return eb - ea;
  if (ea !== null && eb === null) return -1;
  if (ea === null && eb !== null) return 1;
  return (b.mtimeMs ?? 0) - (a.mtimeMs ?? 0);
}

/**
 * @param {{
 *   parentDir: string;
 *   pattern?: string;
 *   patternRegex?: boolean;
 *   limit?: number;
 *   newestFirst?: boolean;
 *   includes?: Array<{ label?: string; repo_root: string }>;
 *   manifestPath?: string;
 * }} input
 */
export async function discoverClients(input) {
  const parentDir = path.resolve(input.parentDir);
  const pattern = input.pattern ?? "wf-agentstream";
  const patternRegex = input.patternRegex === true;
  const limit = input.limit ?? 50;
  const newestFirst = input.newestFirst !== false;
  const diagnostics = [];

  const candidates = [];

  let dirents;
  try {
    dirents = await readdir(parentDir, { withFileTypes: true });
  } catch (err) {
    throw new Error(`DISCOVER_PARENT_UNREADABLE: ${parentDir}: ${err.message}`);
  }

  for (const ent of dirents) {
    if (!ent.isDirectory()) continue;
    if (ent.isSymbolicLink()) {
      diagnostics.push({ code: "SKIP_SYMLINK", message: ent.name });
      continue;
    }
    if (!basenameMatchesPattern(ent.name, pattern, patternRegex)) {
      continue;
    }
    const repoRoot = path.join(parentDir, ent.name);
    if (!(await isEligibleClient(repoRoot))) {
      diagnostics.push({
        code: "SKIP_INELIGIBLE",
        message: `${ent.name}: missing ${REQ_YAML}`,
      });
      continue;
    }
    let mtimeMs = 0;
    try {
      const st = await stat(repoRoot);
      mtimeMs = st.mtimeMs;
    } catch {
      /* ignore */
    }
    candidates.push({ label: ent.name, repo_root: repoRoot, mtimeMs });
  }

  if (newestFirst) {
    candidates.sort(compareNewestFirst);
  }

  const selected = candidates.slice(0, limit);

  const byRoot = new Map();
  for (const row of selected) {
    byRoot.set(path.resolve(row.repo_root), { label: row.label, repo_root: path.resolve(row.repo_root) });
  }

  const extra = [...(input.includes ?? [])];
  if (input.manifestPath) {
    extra.push(...(await loadManifestEntries(input.manifestPath)));
  }

  for (const row of extra) {
    const root = path.resolve(row.repo_root);
    const label = row.label?.trim() || path.basename(root);
    if (!(await isEligibleClient(root))) {
      diagnostics.push({
        code: "SKIP_MANIFEST_INELIGIBLE",
        message: `${label}: missing ${REQ_YAML}`,
      });
      continue;
    }
    if (!byRoot.has(root)) {
      byRoot.set(root, { label, repo_root: root });
    }
  }

  const targets = [...byRoot.values()];
  if (newestFirst) {
    targets.sort((a, b) =>
      compareNewestFirst(
        { label: a.label, mtimeMs: 0 },
        { label: b.label, mtimeMs: 0 },
      ),
    );
  }

  return { parentDir, pattern, patternRegex, diagnostics, targets };
}
