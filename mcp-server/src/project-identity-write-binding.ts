/**
 * [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [ARCH-TIED_PROJECT_IDENTITY_WRITE_BINDING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING]
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveProjectIdentity, type ProjectIdentity } from "./project-identity.js";
import { loadProjectConfig } from "./tied-project-config.js";

export const PROJECT_IDENTITY_MARKER_BASENAME = "project-identity.v1.yaml";

export type BindingStatus = "ok" | "mismatch" | "disabled" | "marker_missing";

export class IdentityWriteBindingError extends Error {
  readonly code = "TIED_IDENTITY_WRITE_BINDING_MISMATCH";

  constructor(message: string) {
    super(message);
    this.name = "IdentityWriteBindingError";
  }
}

const startupCheckedRoots = new Set<string>();

export function resetWriteBindingStateForTests(): void {
  startupCheckedRoots.clear();
}

export function getMarkerFilePath(tiedBasePath: string): string {
  return path.join(path.resolve(tiedBasePath), PROJECT_IDENTITY_MARKER_BASENAME);
}

export function isMarkerBootstrapPath(filePath: string, tiedBasePath: string): boolean {
  const resolved = path.resolve(filePath);
  return resolved === getMarkerFilePath(tiedBasePath);
}

function canonicalTiedRoot(tiedBasePath: string): string {
  return path.resolve(tiedBasePath);
}

function projectRootFromTiedBase(tiedBasePath: string): string {
  return path.dirname(canonicalTiedRoot(tiedBasePath));
}

export function isWriteBindingEnforced(tiedBasePath: string): boolean {
  const loaded = loadProjectConfig(projectRootFromTiedBase(tiedBasePath));
  if (!loaded) return true;
  const identity = loaded.record.identity;
  if (identity !== null && typeof identity === "object" && !Array.isArray(identity)) {
    const wb = (identity as Record<string, unknown>).write_binding;
    if (wb === false) return false;
  }
  return true;
}

type MarkerDoc = {
  project_id: string;
  writable_root: string;
  identity_source?: string;
};

function readMarker(tiedBasePath: string): MarkerDoc | null {
  const markerPath = getMarkerFilePath(tiedBasePath);
  if (!fs.existsSync(markerPath)) return null;
  const raw = yaml.load(fs.readFileSync(markerPath, "utf8"));
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const doc = raw as Record<string, unknown>;
  if (typeof doc.project_id !== "string" || typeof doc.writable_root !== "string") return null;
  return {
    project_id: doc.project_id,
    writable_root: doc.writable_root,
    identity_source:
      typeof doc.identity_source === "string" ? doc.identity_source : undefined,
  };
}

function liveIdentity(tiedBasePath: string, env: NodeJS.ProcessEnv): ProjectIdentity {
  return resolveProjectIdentity(canonicalTiedRoot(tiedBasePath), env);
}

function markerMatchesLive(marker: MarkerDoc, tiedBasePath: string, env: NodeJS.ProcessEnv): boolean {
  const root = canonicalTiedRoot(tiedBasePath);
  const live = liveIdentity(tiedBasePath, env);
  return marker.writable_root === root && marker.project_id === live.project_id;
}

function writeMarkerFile(tiedBasePath: string, env: NodeJS.ProcessEnv): void {
  const root = canonicalTiedRoot(tiedBasePath);
  const live = liveIdentity(tiedBasePath, env);
  const doc: MarkerDoc = {
    project_id: live.project_id,
    writable_root: root,
    identity_source: live.identity_source,
  };
  const markerPath = getMarkerFilePath(tiedBasePath);
  const serialized = yaml.dump(doc, { lineWidth: -1, noRefs: true, sortKeys: false });
  fs.writeFileSync(markerPath, serialized, "utf8");
}

export function ensureProjectIdentityMarker(tiedBasePath: string, env: NodeJS.ProcessEnv = process.env): void {
  if (!isWriteBindingEnforced(tiedBasePath)) return;
  const marker = readMarker(tiedBasePath);
  if (marker && markerMatchesLive(marker, tiedBasePath, env)) return;
  if (marker && !markerMatchesLive(marker, tiedBasePath, env)) {
    throw new IdentityWriteBindingError(
      "DIAGNOSTIC: TIED_IDENTITY_WRITE_BINDING_MISMATCH marker does not match live project identity",
    );
  }
  writeMarkerFile(tiedBasePath, env);
}

export function assertBindingAtStartup(tiedBasePath: string, env: NodeJS.ProcessEnv = process.env): void {
  const root = canonicalTiedRoot(tiedBasePath);
  if (startupCheckedRoots.has(root)) return;
  startupCheckedRoots.add(root);
  if (!isWriteBindingEnforced(tiedBasePath)) return;
  ensureProjectIdentityMarker(tiedBasePath, env);
  const marker = readMarker(tiedBasePath);
  if (!marker) {
    throw new IdentityWriteBindingError(
      "DIAGNOSTIC: TIED_IDENTITY_WRITE_BINDING_MISMATCH project identity marker missing",
    );
  }
  if (!markerMatchesLive(marker, tiedBasePath, env)) {
    throw new IdentityWriteBindingError(
      "DIAGNOSTIC: TIED_IDENTITY_WRITE_BINDING_MISMATCH startup binding failed",
    );
  }
}

function isUnderTiedBase(filePath: string, tiedBasePath: string): boolean {
  const base = canonicalTiedRoot(tiedBasePath);
  const resolved = path.resolve(filePath);
  return resolved === base || resolved.startsWith(base + path.sep);
}

export function assertBindingForWrite(
  filePath: string,
  tiedBasePath: string,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (isMarkerBootstrapPath(filePath, tiedBasePath)) return;
  if (!isWriteBindingEnforced(tiedBasePath)) return;
  if (!isUnderTiedBase(filePath, tiedBasePath)) return;
  assertBindingAtStartup(tiedBasePath, env);
  const marker = readMarker(tiedBasePath);
  if (!marker || !markerMatchesLive(marker, tiedBasePath, env)) {
    throw new IdentityWriteBindingError(
      "DIAGNOSTIC: TIED_IDENTITY_WRITE_BINDING_MISMATCH write rejected",
    );
  }
}

export function bindingStatus(tiedBasePath: string, env: NodeJS.ProcessEnv = process.env): BindingStatus {
  if (!isWriteBindingEnforced(tiedBasePath)) return "disabled";
  const marker = readMarker(tiedBasePath);
  if (!marker) return "marker_missing";
  if (!markerMatchesLive(marker, tiedBasePath, env)) return "mismatch";
  return "ok";
}
