import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import fg from "fast-glob";

import { isRecord, loadCitdpBodyFromFile, loadTrackerFromFile } from "./yaml-load.js";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1b deterministic next slug + open REQ discovery. */

export type TiedNextResult = {
  exit_code: 0 | 1 | 2;
  slug?: string;
  open_request_tokens: string[];
  citdp_phases: Record<string, string | null>;
  current_branch?: string | null;
  rationale: string;
  ambiguous_trackers?: string[];
};

function stepDisposition(step: Record<string, unknown>): string | undefined {
  const tracking = isRecord(step.tracking) ? step.tracking : undefined;
  const fromStep = step.disposition ?? step.status;
  if (typeof fromStep === "string" && fromStep.trim()) {
    return fromStep.trim();
  }
  if (tracking) {
    const t = tracking.disposition ?? tracking.status;
    if (typeof t === "string" && t.trim()) {
      return t.trim();
    }
  }
  return undefined;
}

function trackingStatus(step: Record<string, unknown>): string | undefined {
  if (!isRecord(step.tracking)) {
    return undefined;
  }
  const s = step.tracking.status;
  return typeof s === "string" ? s.trim() : undefined;
}

function trackerSteps(tracker: Record<string, unknown>): Record<string, unknown>[] {
  if (!Array.isArray(tracker.steps)) {
    return [];
  }
  return tracker.steps.filter((s): s is Record<string, unknown> => isRecord(s));
}

export function firstPendingSlugInOrder(tracker: Record<string, unknown>): string | undefined {
  for (const step of trackerSteps(tracker)) {
    const slug = typeof step.slug === "string" ? step.slug : undefined;
    if (!slug) {
      continue;
    }
    const disp = stepDisposition(step);
    const tStatus = trackingStatus(step);
    if (disp === "pending" || tStatus === "pending" || tStatus === "in_progress") {
      return slug;
    }
  }
  return undefined;
}

export function trackerHasOpenWork(tracker: Record<string, unknown>): boolean {
  for (const step of trackerSteps(tracker)) {
    const disp = stepDisposition(step);
    const tStatus = trackingStatus(step);
    if (tStatus === "pending" || tStatus === "in_progress") {
      return true;
    }
    if (disp === "pending") {
      return true;
    }
    if (disp === "waived" && (tStatus === "pending" || tStatus === "in_progress")) {
      return true;
    }
  }
  return false;
}

export function requestTokenFromTracker(tracker: Record<string, unknown>): string | undefined {
  if (!isRecord(tracker.execution_evidence)) {
    return undefined;
  }
  const req = tracker.execution_evidence.request;
  return typeof req === "string" && req.trim() ? req.trim() : undefined;
}

const CLOSED_CITDP_PHASES = new Set(["closed", "close_out"]);

export function citdpPhaseForToken(
  projectRoot: string,
  requestToken: string,
  tiedCitdpDir?: string,
): string | null {
  const citdpPath = path.join(
    tiedCitdpDir ?? path.join(projectRoot, "tied", "citdp"),
    `CITDP-${requestToken}.yaml`,
  );
  if (!fs.existsSync(citdpPath)) {
    return null;
  }
  try {
    const body = loadCitdpBodyFromFile(citdpPath);
    const identity = isRecord(body.record_identity) ? body.record_identity : undefined;
    const phase = identity?.phase;
    return typeof phase === "string" ? phase : null;
  } catch {
    return null;
  }
}

export function discoverTrackerPaths(
  projectRoot: string,
  requestToken?: string,
): string[] {
  const root = path.resolve(projectRoot);
  if (requestToken?.trim()) {
    const token = requestToken.trim();
    const primary = path.join(root, "working", token, "checklist-tracker.yaml");
    const matches: string[] = [];
    if (fs.existsSync(primary)) {
      matches.push(primary);
    }
    const folder = path.join(root, "working", token);
    if (fs.existsSync(folder)) {
      for (const name of fs.readdirSync(folder)) {
        if (!name.includes("checklist") || !name.endsWith(".yaml")) {
          continue;
        }
        const p = path.join(folder, name);
        if (p !== primary && fs.existsSync(p)) {
          matches.push(p);
        }
      }
    }
    return matches;
  }

  const patterns = [
    "working/*/checklist-tracker.yaml",
    "working/**/*checklist*.yaml",
  ];
  const hits = fg.sync(patterns, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
  });
  const tiedDocs = path.join(root, "tied", "docs");
  return hits.filter((p) => !p.startsWith(tiedDocs + path.sep));
}

export function runTiedNext(input: {
  projectRoot: string;
  requestToken?: string;
}): TiedNextResult {
  const projectRoot = path.resolve(input.projectRoot);
  const trackerPaths = discoverTrackerPaths(projectRoot, input.requestToken);

  if (trackerPaths.length === 0) {
    return {
      exit_code: 1,
      open_request_tokens: [],
      citdp_phases: {},
      rationale: "no_tracker_found",
    };
  }

  if (trackerPaths.length > 1 && !input.requestToken?.trim()) {
    return {
      exit_code: 2,
      open_request_tokens: [],
      citdp_phases: {},
      rationale: "ambiguous_trackers",
      ambiguous_trackers: trackerPaths,
    };
  }

  const selectedPath = trackerPaths[0];
  const tracker = loadTrackerFromFile(selectedPath);
  const slug = firstPendingSlugInOrder(tracker);
  if (!slug) {
    return {
      exit_code: 1,
      open_request_tokens: [],
      citdp_phases: {},
      rationale: "no_pending_slug",
    };
  }

  const openTokens: string[] = [];
  const citdpPhases: Record<string, string | null> = {};

  for (const tp of trackerPaths.length > 1 ? trackerPaths : discoverTrackerPaths(projectRoot)) {
    let t: Record<string, unknown>;
    try {
      t = loadTrackerFromFile(tp);
    } catch {
      continue;
    }
    if (!trackerHasOpenWork(t)) {
      continue;
    }
    const token = requestTokenFromTracker(t);
    if (!token) {
      continue;
    }
    if (!openTokens.includes(token)) {
      openTokens.push(token);
      const phase = citdpPhaseForToken(projectRoot, token);
      if (phase && !CLOSED_CITDP_PHASES.has(phase)) {
        citdpPhases[token] = phase;
      }
    }
  }

  let currentBranch: string | null = null;
  try {
    currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    currentBranch = null;
  }

  return {
    exit_code: 0,
    slug,
    open_request_tokens: openTokens,
    citdp_phases: citdpPhases,
    current_branch: currentBranch,
    rationale: `first_pending_slug_in_checklist_order:${slug}`,
  };
}
