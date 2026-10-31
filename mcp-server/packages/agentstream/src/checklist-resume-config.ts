/**
 * [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]
 * Read tied-project/config.yaml checklist.resume_from_tracker for agentstream apply.
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { resolveResumeFromTrackerPolicy } from "@tied/checklist-resume/resume-policy.js";

import type { DryRunConfig } from "./dry-run-config.js";
import { findRepoRootFromPath } from "./repo-root.js";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, "tied-project/config.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return isRecord(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

function projectRootForConfig(workspace: string): string {
  const ws = path.resolve(workspace);
  if (fs.existsSync(path.join(ws, "tied-project/config.yaml"))) {
    return ws;
  }
  const root = findRepoRootFromPath(ws);
  return root !== "" ? root : ws;
}

export function resolveResumePolicyForWorkspace(workspace: string) {
  return resolveResumeFromTrackerPolicy(readRepoTiedYaml(projectRootForConfig(workspace)));
}

export const RESUME_FROM_TRACKER_DISABLED_BY_CONFIG = "resume_from_tracker_disabled_by_config";

// [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: config false blocks CLI; config true auto-applies when tracker path set.
export function shouldApplyResumeFromTracker(cfg: DryRunConfig): boolean {
  const policy = resolveResumePolicyForWorkspace(cfg.workspace);
  if (cfg.resumeFromTracker && policy === "disabled") {
    throw new Error(`agentstream: resume-from-tracker failed: ${RESUME_FROM_TRACKER_DISABLED_BY_CONFIG}`);
  }
  const hasTracker = cfg.checklistTrackerYaml.trim() !== "";
  if (cfg.resumeFromTracker) {
    return hasTracker;
  }
  if (policy === "auto") {
    return hasTracker;
  }
  return false;
}
