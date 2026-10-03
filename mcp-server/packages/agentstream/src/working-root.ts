/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: RESOLVE_WORKING_ROOT — committed vs local working roots with legacy undivided fallback.
 */
import fs from "node:fs";
import path from "node:path";
import { resolveTiedLayout } from "./tied-layout.js";

export type WorkingArtifactKind = "committed" | "local";

/** Segments under `{working}/{REQ}/` routed to tied-bundle/working (local). */
export const LOCAL_WORKING_PREFIXES = [
  "gates/",
  "gate-",
  "adversarial-inquiry/",
  "adherence/",
  "jev/",
  "pseudocode-analysis/",
] as const;

/**
 * Classify a path relative to the per-request working folder (no token prefix).
 */
export function classifyWorkingRelativePath(relativePath: string): WorkingArtifactKind {
  const norm = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const prefix of LOCAL_WORKING_PREFIXES) {
    if (norm.startsWith(prefix)) return "local";
  }
  if (norm.endsWith("-ledger.jsonl") || norm.includes("/ledger.jsonl")) return "local";
  if (/-CLIENT-/.test(norm)) return "local";
  return "committed";
}

/** Store / brownfield: root `working/` until tied/{project}/working exists. */
export function isUndividedWorkingLayout(projectRoot: string): boolean {
  const root = path.resolve(projectRoot);
  const layout = resolveTiedLayout(root);
  if (fs.existsSync(layout.workingCommittedRoot)) return false;
  return fs.existsSync(path.join(root, "working"));
}

export function resolveRequestWorkingBase(
  projectRoot: string,
  requestToken: string,
  kind: WorkingArtifactKind,
): string {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", requestToken);
  }
  const layout = resolveTiedLayout(root);
  const base =
    kind === "committed" ? layout.workingCommittedRoot : layout.workingLocalRoot;
  return path.join(base, requestToken);
}

export function resolveWorkingPath(
  projectRoot: string,
  requestToken: string,
  ...parts: string[]
): string {
  const relative = parts.map(String).join("/");
  const kind = parts.length ? classifyWorkingRelativePath(relative) : "committed";
  const base = resolveRequestWorkingBase(projectRoot, requestToken, kind);
  return parts.length ? path.join(base, ...parts) : base;
}

/** Posix path relative to project root (for receipts, CLI defaults). */
export function workingPathRelativeToProject(
  projectRoot: string,
  requestToken: string,
  ...parts: string[]
): string {
  const abs = resolveWorkingPath(projectRoot, requestToken, ...parts);
  return path.relative(path.resolve(projectRoot), abs).split(path.sep).join("/");
}

/** Global paths under the local working root (not scoped to a REQ token). */
export function resolveGlobalLocalWorkingPath(
  projectRoot: string,
  ...parts: string[]
): string {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", ...parts);
  }
  const layout = resolveTiedLayout(root);
  return path.join(layout.workingLocalRoot, ...parts);
}

export function globalLocalWorkingRelPrefix(projectRoot: string): string {
  const abs = resolveGlobalLocalWorkingPath(projectRoot, ".");
  return path.relative(path.resolve(projectRoot), abs).split(path.sep).join("/");
}

/** Posix prefix for committed per-REQ working (tied/working or undivided working). */
export function committedWorkingRelPrefix(projectRoot: string): string {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return "working";
  }
  const layout = resolveTiedLayout(root);
  return path.relative(root, layout.workingCommittedRoot).split(path.sep).join("/");
}

export function resolveCommittedWorkingPath(projectRoot: string, ...parts: string[]): string {
  const root = path.resolve(projectRoot);
  if (isUndividedWorkingLayout(root)) {
    return path.join(root, "working", ...parts);
  }
  const layout = resolveTiedLayout(root);
  return path.join(layout.workingCommittedRoot, ...parts);
}

export function committedWorkingFileRel(projectRoot: string, ...parts: string[]): string {
  return path
    .relative(path.resolve(projectRoot), resolveCommittedWorkingPath(projectRoot, ...parts))
    .split(path.sep)
    .join("/");
}

const REQ_DIR_RE = /^REQ-[A-Z0-9_]+$/;

/** List REQ-* tokens present under committed and/or local working roots. */
export function listRequestWorkingTokens(projectRoot: string): string[] {
  const root = path.resolve(projectRoot);
  const tokens = new Set<string>();
  const scan = (base: string) => {
    if (!fs.existsSync(base)) return;
    for (const entry of fs.readdirSync(base)) {
      if (REQ_DIR_RE.test(entry)) tokens.add(entry);
    }
  };
  if (isUndividedWorkingLayout(root)) {
    scan(path.join(root, "working"));
    return [...tokens].sort();
  }
  const layout = resolveTiedLayout(root);
  scan(layout.workingCommittedRoot);
  scan(layout.workingLocalRoot);
  return [...tokens].sort();
}

/** True when absPath is under committed, local, or undivided root working tree. */
export function isPathUnderProjectWorking(projectRoot: string, absPath: string): boolean {
  const root = path.resolve(projectRoot);
  const abs = path.resolve(absPath);
  const bases: string[] = [];
  if (isUndividedWorkingLayout(root)) {
    bases.push(path.join(root, "working"));
  } else {
    const layout = resolveTiedLayout(root);
    bases.push(layout.workingCommittedRoot, layout.workingLocalRoot);
  }
  return bases.some((base) => {
    const rel = path.relative(base, abs);
    return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
  });
}
