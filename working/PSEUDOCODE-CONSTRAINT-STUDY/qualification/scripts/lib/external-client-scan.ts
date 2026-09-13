/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Read-only external client sidecar scan + wave list generation (P4-F).
 */
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  classifySidecarText,
  emptySidecarCounts,
  type SidecarCountsByState,
  type SidecarMigrationState,
} from "./fleet-inventory-merge.ts";

export type ExternalSidecarRow = {
  file: string;
  impl_token: string;
  sidecar_path: string;
  classification: SidecarMigrationState;
};

export type InventoryDiffV1 = {
  schema_version: "inventory-diff.v1";
  generated_at: string;
  client_id: string;
  read_only: true;
  repository_root: string;
  sidecar_count: number;
  counts_by_state: SidecarCountsByState;
  dry_run_content_hash: string;
  rows?: Array<{ file: string; classification: string }>;
};

export function implTokenFromSidecarFilename(filename: string): string {
  if (!filename.endsWith("-pseudocode.md")) {
    throw new Error(`DIAGNOSTIC: not a sidecar filename: ${filename}`);
  }
  return filename.replace(/-pseudocode\.md$/, "");
}

export function countsFromRows(rows: ExternalSidecarRow[]): SidecarCountsByState {
  const counts = emptySidecarCounts();
  for (const row of rows) {
    counts[row.classification] = (counts[row.classification] ?? 0) + 1;
  }
  return counts;
}

export function splitSidecarBatches<T>(items: T[], maxSidecars: number): T[][] {
  if (maxSidecars < 1) throw new Error("DIAGNOSTIC: maxSidecars must be >= 1");
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += maxSidecars) {
    batches.push(items.slice(i, i + maxSidecars));
  }
  return batches;
}

export async function scanExternalClientSidecars(
  repositoryRoot: string,
): Promise<ExternalSidecarRow[]> {
  const implDir = join(repositoryRoot, "tied/implementation-decisions");
  await access(implDir);
  const files = (await readdir(implDir))
    .filter((f) => f.endsWith("-pseudocode.md"))
    .sort();
  const rows: ExternalSidecarRow[] = [];
  for (const file of files) {
    const text = await readFile(join(implDir, file), "utf8");
    const impl_token = implTokenFromSidecarFilename(file);
    rows.push({
      file,
      impl_token,
      sidecar_path: join(implDir, `${impl_token}-pseudocode.md`),
      classification: classifySidecarText(text),
    });
  }
  return rows;
}

export function buildInventoryDiffV1(
  clientId: string,
  repositoryRoot: string,
  rows: ExternalSidecarRow[],
): InventoryDiffV1 {
  const counts = countsFromRows(rows);
  const rowSummary = rows.map((r) => ({ file: r.file, classification: r.classification }));
  const payload = JSON.stringify({ client_id: clientId, rows: rowSummary, counts });
  const dry_run_content_hash = createHash("sha256").update(payload).digest("hex");
  return {
    schema_version: "inventory-diff.v1",
    generated_at: new Date().toISOString(),
    client_id: clientId,
    read_only: true,
    repository_root: repositoryRoot,
    sidecar_count: rows.length,
    counts_by_state: counts,
    dry_run_content_hash,
    rows: rowSummary,
  };
}

export function renderWaveSidecarListYaml(input: {
  schema_version?: number;
  client_id: string;
  methodology_pin: string;
  wave_id: string;
  sidecars: Array<{ impl_token: string; sidecar_path: string }>;
  notes?: string;
}): string {
  const lines: string[] = [
    `# [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] ${input.wave_id} external G3 batch.`,
    `schema_version: ${input.schema_version ?? 1}`,
    `client_id: "${input.client_id}"`,
    `methodology_pin: "${input.methodology_pin}"`,
    `wave_id: "${input.wave_id}"`,
  ];
  if (input.notes) {
    lines.push("notes: |");
    for (const noteLine of input.notes.split("\n")) {
      lines.push(`  ${noteLine}`);
    }
  }
  lines.push("sidecars:");
  for (const row of input.sidecars) {
    lines.push(`  - impl_token: ${row.impl_token}`);
    const pathVal = row.sidecar_path.includes(" ")
      ? `"${row.sidecar_path}"`
      : row.sidecar_path;
    lines.push(`    sidecar_path: ${pathVal}`);
  }
  return `${lines.join("\n")}\n`;
}

export type ManifestClientRow = {
  client_id: string;
  repository_root?: string;
  methodology_pin?: string;
  phase_4_enrollment?: string;
};

export type InventoryManifestFile = {
  clients: ManifestClientRow[];
};

export function findManifestClient(
  manifest: InventoryManifestFile,
  clientId: string,
): ManifestClientRow {
  const row = manifest.clients.find((c) => c.client_id === clientId);
  if (!row) {
    throw new Error(`DIAGNOSTIC: client_id ${clientId} not in manifest`);
  }
  return row;
}
