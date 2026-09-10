import { join } from "node:path";
import { PATHS, QUALIFICATION_ROOT, REPO_ROOT } from "./constants.ts";

/** [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Per-REQ qualification outputs — never write to external client trees. */
export const CONSTRAINT_QUALIFICATION_ROOT = join(
  REPO_ROOT,
  "working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/qualification",
);

export const CONSTRAINT_PATHS = {
  manifest: PATHS.manifest,
  phase3: join(QUALIFICATION_ROOT, "phase3"),
  phase3Snapshots: PATHS.snapshots,
  baseline: join(CONSTRAINT_QUALIFICATION_ROOT, "baseline"),
  pilot: join(CONSTRAINT_QUALIFICATION_ROOT, "pilot"),
  phaseGate: join(CONSTRAINT_QUALIFICATION_ROOT, "phase-gate"),
  snapshots: join(CONSTRAINT_QUALIFICATION_ROOT, "snapshots"),
  metrics: join(CONSTRAINT_QUALIFICATION_ROOT, "metrics"),
} as const;
