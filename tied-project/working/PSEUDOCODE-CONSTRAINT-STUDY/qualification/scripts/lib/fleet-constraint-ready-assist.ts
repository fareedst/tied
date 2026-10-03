/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Dry-run / apply assist for Layer B procedure Contract stubs.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseProcedureBlocks,
  procedureBodyHasLayerBContract,
  sidecarMeetsConstraintReadyV2Floor,
} from "./constraint-ready-classify.ts";
import { classifySidecarText, type SidecarMigrationState } from "./fleet-inventory-merge.ts";
import { sidecarAbsPath } from "./fleet-migration-apply.ts";

export type ConstraintReadyAction =
  | "insert_minimal_procedure_contract"
  | "flag_manual_contract_migration"
  | "none";

export type ProcedureContractGap = {
  procedure_name: string;
  start_line: number;
};

export type PlannedConstraintReadyAction = {
  sidecar_path: string;
  impl_token: string;
  action: ConstraintReadyAction;
  classification_before: SidecarMigrationState;
  procedure_gaps: ProcedureContractGap[];
};

export type ConstraintReadyDryRunDocument = {
  schema_version: "constraint-ready-diff.v1";
  generated_at: string;
  client_id: string;
  wave_scope: string;
  methodology_pin: string;
  apply_mode: boolean;
  planned_actions: PlannedConstraintReadyAction[];
  dry_run_content_hash: string;
  snapshot_dir?: string;
};

export const MINIMAL_PROCEDURE_CONTRACT_STUB = `  Contract:
    INPUT: TBD
    PRE: TBD
    POST:
      - success => TBD
    EFFECTS: pure
`;

export function listProceduresMissingLayerBContract(text: string): ProcedureContractGap[] {
  const gaps: ProcedureContractGap[] = [];
  for (const block of parseProcedureBlocks(text)) {
    if (!procedureBodyHasLayerBContract(block.body)) {
      gaps.push({ procedure_name: block.name, start_line: block.startLine });
    }
  }
  return gaps;
}

export function sidecarUsesLegacyInputCommentsOnly(text: string): boolean {
  if (parseProcedureBlocks(text).length > 0) return false;
  return /#\s*INPUT\s*:/i.test(text) && !sidecarMeetsConstraintReadyV2Floor(text);
}

export function planConstraintReadyActionForSidecar(
  sidecar_path: string,
  impl_token: string,
  text: string,
): PlannedConstraintReadyAction {
  const classification_before = classifySidecarText(text);
  const procedure_gaps = listProceduresMissingLayerBContract(text);
  let action: ConstraintReadyAction = "none";
  if (classification_before === "legacy-v1") {
    action = "none";
  } else if (procedure_gaps.length > 0) {
    action = "insert_minimal_procedure_contract";
  } else if (sidecarUsesLegacyInputCommentsOnly(text)) {
    action = "flag_manual_contract_migration";
  }
  return { sidecar_path, impl_token, action, classification_before, procedure_gaps };
}

export function insertMinimalContractAfterProcedureLine(
  text: string,
  procedureName: string,
): string {
  const block = parseProcedureBlocks(text).find((b) => b.name === procedureName);
  if (!block) {
    throw new Error(`DIAGNOSTIC: procedure not found ${procedureName}`);
  }
  if (procedureBodyHasLayerBContract(block.body)) {
    return text;
  }
  const lines = text.split("\n");
  const stubLines = MINIMAL_PROCEDURE_CONTRACT_STUB.split("\n");
  const insertAt = block.startLine + 1;
  lines.splice(insertAt, 0, ...stubLines);
  return lines.join("\n");
}

export function applyMinimalProcedureContracts(text: string, gaps: ProcedureContractGap[]): string {
  let out = text;
  const sorted = [...gaps].sort((a, b) => b.start_line - a.start_line);
  for (const gap of sorted) {
    out = insertMinimalContractAfterProcedureLine(out, gap.procedure_name);
  }
  return out;
}

export function normalizeConstraintReadyActionsForHash(
  actions: PlannedConstraintReadyAction[],
): {
  sidecar_path: string;
  action: ConstraintReadyAction;
  classification_before: string;
  procedure_gaps: ProcedureContractGap[];
}[] {
  return actions.map((a) => ({
    sidecar_path: a.sidecar_path,
    action: a.action,
    classification_before: a.classification_before,
    procedure_gaps: a.procedure_gaps,
  }));
}

export function computeConstraintReadyDryRunHash(
  actions: PlannedConstraintReadyAction[],
): string {
  const normalized = JSON.stringify(normalizeConstraintReadyActionsForHash(actions));
  return createHash("sha256").update(normalized).digest("hex");
}

export function hashMatchesConstraintReadyDoc(
  actions: PlannedConstraintReadyAction[],
  doc: Pick<ConstraintReadyDryRunDocument, "dry_run_content_hash">,
): boolean {
  return computeConstraintReadyDryRunHash(actions) === doc.dry_run_content_hash;
}

export type ApplyConstraintReadyOptions = {
  repositoryRoot: string;
  actions: PlannedConstraintReadyAction[];
  snapshotDir: string;
};

export type ApplyConstraintReadyResult = {
  modified_paths: string[];
  snapshot_paths: string[];
  skipped_none: number;
  skipped_manual_flag: number;
};

export async function applyConstraintReadyPlannedActions(
  options: ApplyConstraintReadyOptions,
): Promise<ApplyConstraintReadyResult> {
  const { repositoryRoot, actions, snapshotDir } = options;
  await mkdir(snapshotDir, { recursive: true });
  const modified_paths: string[] = [];
  const snapshot_paths: string[] = [];
  let skipped_none = 0;
  let skipped_manual_flag = 0;

  for (const row of actions) {
    if (row.action === "none") {
      skipped_none += 1;
      continue;
    }
    if (row.action === "flag_manual_contract_migration") {
      skipped_manual_flag += 1;
      console.log(
        `TRACE: skip apply manual migration flag ${row.impl_token} path=${row.sidecar_path}`,
      );
      continue;
    }
    const abs = sidecarAbsPath(repositoryRoot, row.sidecar_path);
    const before = await readFile(abs, "utf8");
    const snapPath = join(snapshotDir, `${row.impl_token}.before.bytes`);
    await writeFile(snapPath, before, "utf8");
    snapshot_paths.push(snapPath);
    const after = applyMinimalProcedureContracts(before, row.procedure_gaps);
    if (after !== before) {
      await writeFile(abs, after, "utf8");
      modified_paths.push(row.sidecar_path);
      console.log(
        `DEBUG: applied minimal procedure contract ${row.impl_token} gaps=${row.procedure_gaps.length}`,
      );
    }
  }
  console.log(
    `TRACE: applyConstraintReady modified=${modified_paths.length} skipped_none=${skipped_none} skipped_manual=${skipped_manual_flag}`,
  );
  return { modified_paths, snapshot_paths, skipped_none, skipped_manual_flag };
}
