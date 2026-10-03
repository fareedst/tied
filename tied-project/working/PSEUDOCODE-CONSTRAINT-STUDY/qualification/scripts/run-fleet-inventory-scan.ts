#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — fleet inventory scan across manifest clients.
 */
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT, STDD_PROJECT_SIDECARS_ROOT } from "./lib/constants.ts";
import {
  countsFalsifyAggregate,
  mergeScanIntoClientRow,
  scanClientSidecars,
  type ClientInventoryRow,
} from "./lib/fleet-inventory-merge.ts";
import { yaml } from "./lib/yaml-io.ts";

const DEFAULT_MANIFEST = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml",
);

type InventoryManifest = {
  schema_version: number;
  manifest_id: string;
  updated_at: string;
  clients: ClientInventoryRow[];
};

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function sidecarsDirForClient(row: ClientInventoryRow): Promise<string | null> {
  if (row.client_id === "stdd") {
    return STDD_PROJECT_SIDECARS_ROOT;
  }
  const root = row.repository_root;
  if (!root) return null;
  const candidate = join(root, "tied/implementation-decisions");
  try {
    await access(candidate);
    return candidate;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const manifestPath = argValue("--manifest") ?? DEFAULT_MANIFEST;
  const raw = await readFile(manifestPath, "utf8");
  const manifest = yaml.load(raw) as InventoryManifest;
  let falsified = false;

  for (const row of manifest.clients) {
    const scanEnrolled =
      row.phase_4_enrollment === "enrolled_phase_4" || row.client_id === "stdd";
    if (!scanEnrolled) {
      console.log(`TRACE: skip scan client ${row.client_id} (not enrolled_phase_4)`);
      continue;
    }
    const dir = await sidecarsDirForClient(row);
    if (!dir) {
      console.log(`TRACE: skip scan client ${row.client_id} (no sidecar dir)`);
      continue;
    }
    const scan = await scanClientSidecars(row.repository_root ?? REPO_ROOT, row.client_id, dir);
    console.log(
      `DEBUG: ${row.client_id} scanned=${scan.scanned} header-only=${scan.counts["header-only-v2"]} legacy=${scan.counts["legacy-v1"]}`,
    );
    if (!apply && countsFalsifyAggregate(row, scan)) {
      falsified = true;
      console.log(
        `TRACE: aggregate mismatch ${row.client_id} manifest=${row.aggregate_migration_state} scan-derived=${JSON.stringify(scan.counts)}`,
      );
    }
    if (apply) {
      const idx = manifest.clients.findIndex((c) => c.client_id === row.client_id);
      const merged = mergeScanIntoClientRow(row, scan);
      const summaryRel = `working/fleet-constraint-v2/waves/${row.client_id}/receipts/summary.json`;
      const summaryAbs = join(REPO_ROOT, summaryRel);
      try {
        await access(summaryAbs);
        (merged as ClientInventoryRow & { last_receipt_path?: string }).last_receipt_path =
          summaryRel;
      } catch {
        /* no wave receipts yet */
      }
      manifest.clients[idx] = merged;
    }
  }

  if (apply) {
    manifest.updated_at = new Date().toISOString();
    await writeFile(manifestPath, `${yaml.dump(manifest)}`, "utf8");
    console.log(`TRACE: manifest updated ${manifestPath}`);
  }

  if (falsified) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
