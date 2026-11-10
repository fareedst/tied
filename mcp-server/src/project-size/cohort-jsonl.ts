/**
 * [IMPL-TIED_PROJECT_SIZE_COHORT_JSONL] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS]
 */

import { appendFile, access, mkdir } from "node:fs/promises";
import path from "node:path";

import { prettyCanonicalJson } from "../storage-dump.js";
import type { ProjectSizeSnapshotReceipt } from "./types.js";
import { COHORT_ROW_SCHEMA_VERSION, PROOF_BOUNDARY } from "./types.js";

export const DEFAULT_COHORT_REL = "tied-bundle/reports/wf-trial-cohort/runs.jsonl";

export type WfTrialCohortRunRow = {
  schema_version: typeof COHORT_ROW_SCHEMA_VERSION;
  recorded_at: string;
  proof_boundary: typeof PROOF_BOUNDARY;
  client_id?: string;
  prompt_id?: string;
  snapshot: Pick<ProjectSizeSnapshotReceipt, "repo_root" | "layers" | "hashes" | "cross_layer">;
  trial_factors?: ProjectSizeSnapshotReceipt["trial_factors"];
};

export async function appendWfTrialCohortRun(input: {
  store_root: string;
  row: Omit<WfTrialCohortRunRow, "schema_version" | "recorded_at" | "proof_boundary">;
  cohort_rel_path?: string;
}): Promise<{ ok: boolean; path: string }> {
  const rel = input.cohort_rel_path ?? DEFAULT_COHORT_REL;
  const abs = path.join(path.resolve(input.store_root), rel);
  await mkdir(path.dirname(abs), { recursive: true });
  try {
    await access(abs);
  } catch {
    // create on first append
  }
  const line: WfTrialCohortRunRow = {
    schema_version: COHORT_ROW_SCHEMA_VERSION,
    recorded_at: new Date().toISOString(),
    proof_boundary: PROOF_BOUNDARY,
    ...input.row,
  };
  if (!line.snapshot?.layers || !line.snapshot.hashes) {
    throw new Error("INVALID_ROW_SHAPE: snapshot.layers and snapshot.hashes required");
  }
  await appendFile(abs, `${prettyCanonicalJson(line)}\n`, "utf8");
  return { ok: true, path: abs };
}
