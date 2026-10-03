/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Classify sidecars and merge scan into client-inventory-manifest rows.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  sidecarMeetsConstraintEnforcedV2Floor,
  sidecarMeetsConstraintReadyV2Floor,
} from "./constraint-ready-classify.ts";

export type SidecarMigrationState =
  | "legacy-v1"
  | "header-only-v2"
  | "constraint-ready-v2"
  | "constraint-enforced-v2"
  | "unknown-or-mixed";

export type SidecarCountsByState = Record<SidecarMigrationState, number>;

export type ClientInventoryRow = {
  client_id: string;
  sidecar_counts_by_state: SidecarCountsByState;
  aggregate_migration_state: string;
  updated_at: string;
  repository_root?: string;
  phase_4_enrollment?: string;
  [key: string]: unknown;
};

export type ClientSidecarScan = {
  client_id: string;
  scanned: number;
  counts: SidecarCountsByState;
};

const STATE_ORDER: SidecarMigrationState[] = [
  "legacy-v1",
  "header-only-v2",
  "constraint-ready-v2",
  "constraint-enforced-v2",
];

export function emptySidecarCounts(): SidecarCountsByState {
  return {
    "legacy-v1": 0,
    "header-only-v2": 0,
    "constraint-ready-v2": 0,
    "constraint-enforced-v2": 0,
    "unknown-or-mixed": 0,
  };
}

/** v2 header + Layer B contract floor on active procedure OR Tier-3 markers (OD-P4 constraint-ready assist). */
export function classifySidecarText(text: string): SidecarMigrationState {
  if (!/Grammar-Version:\s*v2/i.test(text)) return "legacy-v1";
  if (sidecarMeetsConstraintEnforcedV2Floor(text)) return "constraint-enforced-v2";
  if (sidecarMeetsConstraintReadyV2Floor(text)) return "constraint-ready-v2";
  return "header-only-v2";
}

export function aggregateMigrationState(counts: SidecarCountsByState): string {
  for (let i = STATE_ORDER.length - 1; i >= 0; i -= 1) {
    const key = STATE_ORDER[i];
    if ((counts[key] ?? 0) > 0) return key;
  }
  if ((counts["unknown-or-mixed"] ?? 0) > 0) return "unknown-or-mixed";
  return "legacy-v1";
}

/** True when every scanned sidecar is constraint-enforced-v2 (S1.6 fleet-migrated-client gate). */
export function sidecarCountsAllConstraintEnforcedV2(
  counts: SidecarCountsByState,
  scanned: number,
): boolean {
  if (scanned <= 0) return false;
  if ((counts["constraint-enforced-v2"] ?? 0) !== scanned) return false;
  return (
    (counts["legacy-v1"] ?? 0) === 0 &&
    (counts["header-only-v2"] ?? 0) === 0 &&
    (counts["constraint-ready-v2"] ?? 0) === 0 &&
    (counts["unknown-or-mixed"] ?? 0) === 0
  );
}

export function resolveAggregateMigrationState(
  scan: ClientSidecarScan,
  row?: Pick<ClientInventoryRow, "phase_4_enrollment">,
): string {
  const sidecarAggregate = aggregateMigrationState(scan.counts);
  if (
    row?.phase_4_enrollment === "enrolled_phase_4" &&
    sidecarCountsAllConstraintEnforcedV2(scan.counts, scan.scanned)
  ) {
    return "fleet-migrated-client";
  }
  return sidecarAggregate;
}

export function mergeScanIntoClientRow(
  row: ClientInventoryRow,
  scan: ClientSidecarScan,
): ClientInventoryRow {
  if (row.client_id !== scan.client_id) {
    throw new Error(`DIAGNOSTIC: client_id mismatch ${row.client_id} vs ${scan.client_id}`);
  }
  return {
    ...row,
    sidecar_counts_by_state: { ...scan.counts },
    aggregate_migration_state: resolveAggregateMigrationState(scan, row),
    updated_at: new Date().toISOString(),
  };
}

export async function scanClientSidecars(
  repositoryRoot: string,
  clientId: string,
  sidecarsDir: string,
): Promise<ClientSidecarScan> {
  const counts = emptySidecarCounts();
  let scanned = 0;
  let entries: string[];
  try {
    entries = await readdir(sidecarsDir);
  } catch {
    return { client_id: clientId, scanned: 0, counts };
  }
  for (const name of entries) {
    if (!name.endsWith("-pseudocode.md")) continue;
    scanned += 1;
    const text = await readFile(join(sidecarsDir, name), "utf8");
    const state = classifySidecarText(text);
    counts[state] += 1;
  }
  if (scanned === 0 && repositoryRoot) {
    console.log(`TRACE: no sidecars under ${sidecarsDir} for client ${clientId}`);
  }
  return { client_id: clientId, scanned, counts };
}

export function countsFalsifyAggregate(
  row: ClientInventoryRow,
  scan: ClientSidecarScan,
): boolean {
  const expected = resolveAggregateMigrationState(scan, row);
  return row.aggregate_migration_state !== expected;
}
