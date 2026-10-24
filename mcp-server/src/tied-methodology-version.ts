/**
 * [REQ-TIED_SETUP] [REQ-REQUEST_EVIDENCE_ENVELOPE] Read semver from repo root VERSION file.
 */
import fs from "node:fs";
import path from "node:path";

import { projectRootFromTiedBase } from "./request-evidence-envelope/hooks.js";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

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

export type ReadTiedMethodologyVersionInput = {
  project_root?: string;
  tied_base_path?: string;
};

/**
 * PRE: At least one anchor resolves to a tree containing VERSION.
 * POST: Trimmed semver string; cached per first resolved VERSION path.
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

  const searchRoots = [...anchors];
  const cwd = process.cwd();
  if (!searchRoots.includes(cwd)) {
    searchRoots.push(cwd);
  }

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

  throw new Error(
    `VERSION file not found from anchors: ${searchRoots.join(", ")}`,
  );
}
