/**
 * [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [ARCH-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING]
 * Path 3: when identity.routing is marker_only, writable root comes from project-identity.v1.yaml.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { PROJECT_IDENTITY_MARKER_BASENAME } from "./project-identity-write-binding.js";
import {
  IDENTITY_ROUTING_MARKER_ONLY,
  loadProjectConfig,
  readIdentityRoutingFromRecord,
} from "./tied-project-config.js";
import {
  LEGACY_PROJECT_DIR_NAME,
  PROJECT_DIR_NAME,
  resolveTiedLayout,
} from "./tied-layout.js";

export type BasePathSource = "marker" | "env" | "discover";

export type MarkerOnlyResolveResult = {
  writableRoot: string;
  projectRoot: string;
  basePathSource: BasePathSource;
  routingMode: typeof IDENTITY_ROUTING_MARKER_ONLY;
};

const MAX_WALK_DEPTH = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requirementsIndexAt(tiedDir: string): string {
  return path.join(tiedDir, "requirements.yaml");
}

type MarkerDoc = {
  writable_root: string;
};

function readMarkerWritableRoot(markerPath: string): MarkerDoc | null {
  if (!fs.existsSync(markerPath)) return null;
  const raw = yaml.load(fs.readFileSync(markerPath, "utf8"));
  if (!isRecord(raw) || typeof raw.writable_root !== "string") return null;
  return { writable_root: raw.writable_root };
}

function tiedRootsUnderProjectRoot(projectRoot: string): string[] {
  const modern = path.join(projectRoot, PROJECT_DIR_NAME);
  const legacy = path.join(projectRoot, LEGACY_PROJECT_DIR_NAME);
  const out: string[] = [];
  if (fs.existsSync(modern)) out.push(modern);
  if (fs.existsSync(legacy)) out.push(legacy);
  return out;
}

function resolveWritableRootFromMarkerOnlyProject(
  projectRoot: string,
  tiedDir: string,
): MarkerOnlyResolveResult | null {
  const markerPath = path.join(tiedDir, PROJECT_IDENTITY_MARKER_BASENAME);
  const marker = readMarkerWritableRoot(markerPath);
  if (marker) {
    const writableRoot = path.resolve(marker.writable_root);
    if (fs.existsSync(requirementsIndexAt(writableRoot))) {
      return {
        writableRoot,
        projectRoot,
        basePathSource: "marker",
        routingMode: IDENTITY_ROUTING_MARKER_ONLY,
      };
    }
  }
  if (fs.existsSync(requirementsIndexAt(tiedDir))) {
    return {
      writableRoot: path.resolve(tiedDir),
      projectRoot,
      basePathSource: "discover",
      routingMode: IDENTITY_ROUTING_MARKER_ONLY,
    };
  }
  return null;
}

/**
 * Walk upward from cwd for a client with identity.routing marker_only.
 * PRE: cwd is process.cwd() or test anchor
 * POST: null when no marker_only client found on walk path
 */
export function tryResolveMarkerOnlyBaseFromCwd(cwd: string): MarkerOnlyResolveResult | null {
  let dir = path.resolve(cwd);
  for (let depth = 0; depth < MAX_WALK_DEPTH; depth++) {
    const layout = resolveTiedLayout(dir);
    if (fs.existsSync(layout.projectConfigPath)) {
      let loaded;
      try {
        loaded = loadProjectConfig(dir);
      } catch {
        loaded = null;
      }
      if (loaded && readIdentityRoutingFromRecord(loaded.record) === IDENTITY_ROUTING_MARKER_ONLY) {
        const tiedCandidates = tiedRootsUnderProjectRoot(dir);
        for (const tiedDir of tiedCandidates) {
          const hit = resolveWritableRootFromMarkerOnlyProject(dir, tiedDir);
          if (hit) return hit;
        }
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
