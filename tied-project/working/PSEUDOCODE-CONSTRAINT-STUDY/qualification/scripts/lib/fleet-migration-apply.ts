/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * Plan and apply Grammar-Version v2 header assist for in-scope fleet wave sidecars.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { classifySidecarText, type SidecarMigrationState } from "./fleet-inventory-merge.ts";

export function sidecarAbsPath(repositoryRoot: string, sidecarPath: string): string {
  const normalized = sidecarPath.trim().replace(/^"|"$/g, "");
  if (normalized.startsWith("/")) return normalized;
  return join(repositoryRoot, normalized);
}

export type MigrationApplyAction = "insert_grammar_v2_header" | "none";

export type PlannedSidecarAction = {
  sidecar_path: string;
  impl_token: string;
  action: MigrationApplyAction;
  classification_before: SidecarMigrationState;
};

export type ApplyDryRunDocument = {
  schema_version: "apply-diff.v1";
  generated_at: string;
  client_id: string;
  wave_scope: string;
  methodology_pin: string;
  apply_mode: boolean;
  planned_actions: PlannedSidecarAction[];
  dry_run_content_hash: string;
  snapshot_dir?: string;
};

/** Same insertion heuristic as run-pilot-inventory-scan.ts (OD-P3-5). */
export function insertGrammarV2Header(text: string): string {
  if (/Grammar-Version:\s*v2/i.test(text)) return text;
  const lines = text.split("\n");
  const insertAt = lines.findIndex((l) => l.startsWith("## ") || l.startsWith("procedure "));
  const idx = insertAt > 0 ? insertAt : Math.min(3, lines.length);
  lines.splice(idx, 0, "", "Grammar-Version: v2", "");
  return lines.join("\n");
}

export function planActionForSidecar(
  sidecar_path: string,
  impl_token: string,
  text: string,
): PlannedSidecarAction {
  const classification_before = classifySidecarText(text);
  const action: MigrationApplyAction =
    classification_before === "legacy-v1" ? "insert_grammar_v2_header" : "none";
  return { sidecar_path, impl_token, action, classification_before };
}

export function normalizeActionsForHash(
  actions: PlannedSidecarAction[],
): { sidecar_path: string; action: MigrationApplyAction; classification_before: string }[] {
  return actions.map((a) => ({
    sidecar_path: a.sidecar_path,
    action: a.action,
    classification_before: a.classification_before,
  }));
}

export function computeDryRunContentHash(actions: PlannedSidecarAction[]): string {
  const normalized = JSON.stringify(normalizeActionsForHash(actions));
  return createHash("sha256").update(normalized).digest("hex");
}

export type ApplyPlannedActionsOptions = {
  repositoryRoot: string;
  actions: PlannedSidecarAction[];
  snapshotDir: string;
};

export type ApplyPlannedActionsResult = {
  modified_paths: string[];
  snapshot_paths: string[];
  skipped_none: number;
};

export async function applyPlannedActions(
  options: ApplyPlannedActionsOptions,
): Promise<ApplyPlannedActionsResult> {
  const { repositoryRoot, actions, snapshotDir } = options;
  await mkdir(snapshotDir, { recursive: true });
  const modified_paths: string[] = [];
  const snapshot_paths: string[] = [];
  let skipped_none = 0;

  for (const row of actions) {
    if (row.action === "none") {
      skipped_none += 1;
      continue;
    }
    const abs = sidecarAbsPath(repositoryRoot, row.sidecar_path);
    const before = await readFile(abs, "utf8");
    const snapName = `${row.impl_token}.before.bytes`;
    const snapPath = join(snapshotDir, snapName);
    await writeFile(snapPath, before, "utf8");
    snapshot_paths.push(snapPath);
    const after = insertGrammarV2Header(before);
    if (after !== before) {
      await writeFile(abs, after, "utf8");
      modified_paths.push(row.sidecar_path);
      console.log(`DEBUG: applied v2 header ${row.impl_token} path=${row.sidecar_path}`);
    }
  }
  console.log(
    `TRACE: applyPlannedActions modified=${modified_paths.length} skipped_none=${skipped_none}`,
  );
  return { modified_paths, snapshot_paths, skipped_none };
}

export function sidecarSnapshotBasename(implToken: string): string {
  return `${implToken}.before.bytes`;
}

export function hashMatchesDryRunDoc(
  actions: PlannedSidecarAction[],
  doc: Pick<ApplyDryRunDocument, "dry_run_content_hash">,
): boolean {
  return computeDryRunContentHash(actions) === doc.dry_run_content_hash;
}
