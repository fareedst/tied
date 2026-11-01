/**
 * [REQ-TIED_SETUP] [REQ-REQUEST_EVIDENCE_ENVELOPE] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
 * Read methodology semver from VERSION, install config, or AGENTS.md.
 */
import fs from "node:fs";
import path from "node:path";

import { projectRootFromTiedBase } from "./request-evidence-envelope/hooks.js";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const AGENTS_VERSION_LINE = /^\*\*TIED Methodology Version\*\*:\s*(.+)\s*$/m;

let cached: { anchor: string; version: string } | null = null;

/** Test hook — clear in-process cache between cases. */
export function clearTiedMethodologyVersionCache(): void {
  cached = null;
}

function readVersionFile(versionPath: string): string {
  const raw = fs.readFileSync(versionPath, "utf8");
  const version = raw.trim();
  if (!SEMVER_RE.test(version)) {
    throw new Error(`Invalid VERSION semver at ${versionPath}: ${JSON.stringify(raw)}`);
  }
  return version;
}

function findVersionPath(startDir: string): string | null {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 12; i += 1) {
    const candidate = path.join(dir, "VERSION");
    try {
      if (fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      /* continue upward */
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function readInstallConfigVersion(projectRoot: string): string | undefined {
  const configPath = path.join(projectRoot, "tied-bundle", "install.json");
  try {
    if (!fs.statSync(configPath).isFile()) return undefined;
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8")) as Record<string, unknown>;
    const raw = parsed.store_methodology_version ?? parsed.tied_version;
    if (typeof raw !== "string") return undefined;
    const version = raw.trim();
    return SEMVER_RE.test(version) ? version : undefined;
  } catch {
    return undefined;
  }
}

function readAgentsMdVersion(projectRoot: string): string | undefined {
  const agentsPath = path.join(projectRoot, "AGENTS.md");
  try {
    if (!fs.statSync(agentsPath).isFile()) return undefined;
    const match = fs.readFileSync(agentsPath, "utf8").match(AGENTS_VERSION_LINE);
    const version = match?.[1]?.trim();
    return version && SEMVER_RE.test(version) ? version : undefined;
  } catch {
    return undefined;
  }
}

function uniqueProjectRoots(roots: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const root of roots) {
    const resolved = path.resolve(root);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    out.push(resolved);
  }
  return out;
}

export type ReadTiedMethodologyVersionInput = {
  project_root?: string;
  tied_base_path?: string;
};

/**
 * PRE: At least one anchor resolves semver via VERSION, install.json, or AGENTS.md.
 * POST: Trimmed semver string; cached per first resolved source path/key.
 */
export function readTiedMethodologyVersion(input: ReadTiedMethodologyVersionInput = {}): string {
  const anchors: string[] = [];
  if (input.project_root?.trim()) {
    anchors.push(path.resolve(input.project_root.trim()));
  }
  if (input.tied_base_path?.trim()) {
    anchors.push(projectRootFromTiedBase(input.tied_base_path.trim()));
  }
  if (anchors.length === 0) {
    anchors.push(process.cwd());
  }

  const searchRoots = uniqueProjectRoots(anchors);

  for (const anchor of searchRoots) {
    const versionPath = findVersionPath(anchor);
    if (!versionPath) continue;
    if (cached?.anchor === versionPath) {
      return cached.version;
    }
    const version = readVersionFile(versionPath);
    cached = { anchor: versionPath, version };
    return version;
  }

  for (const root of searchRoots) {
    const fromInstall = readInstallConfigVersion(root);
    if (fromInstall) {
      const cacheKey = `install.json:${root}`;
      if (cached?.anchor === cacheKey) return cached.version;
      cached = { anchor: cacheKey, version: fromInstall };
      return fromInstall;
    }
  }

  for (const root of searchRoots) {
    const fromAgents = readAgentsMdVersion(root);
    if (fromAgents) {
      const cacheKey = `AGENTS.md:${root}`;
      if (cached?.anchor === cacheKey) return cached.version;
      cached = { anchor: cacheKey, version: fromAgents };
      return fromAgents;
    }
  }

  const testRepoRoot = process.env.TIED_MCP_TEST_REPO_ROOT?.trim();
  if (testRepoRoot) {
    const versionPath = findVersionPath(testRepoRoot);
    if (versionPath) {
      const version = readVersionFile(versionPath);
      cached = { anchor: versionPath, version };
      return version;
    }
  }

  throw new Error(
    `Methodology semver not found from project roots: ${searchRoots.join(", ")} (checked VERSION walk, tied-bundle/install.json store_methodology_version, AGENTS.md)`,
  );
}
