#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — G3 fleet receipts for one partition wave.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G3_FLEET_OPTIONS,
  fleetReceiptContext,
} from "./lib/constraint-migration-receipt.ts";
import {
  getWaveById,
  loadFleetWavePartition,
} from "./lib/fleet-wave-partition.ts";
import {
  fleetWaveEntryToManifestEntry,
  readWaveSidecarList,
} from "./lib/pilot-wave.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  if (!waveId) {
    console.error("Usage: run-fleet-g3-receipts.ts --wave-id W-stdd-2 [--receipts-dir PATH] [--partition PATH]");
    process.exit(1);
  }
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const waveEntry = getWaveById(partition, waveId);
  if (!waveEntry.sidecar_list_path) {
    throw new Error(`DIAGNOSTIC: wave ${waveId} missing sidecar_list_path`);
  }
  const wave = await readWaveSidecarList(waveEntry.sidecar_list_path);
  if (wave.sidecars.length === 0) {
    console.error(`TRACE: wave ${waveId} has empty sidecar list — nothing to emit`);
    process.exit(1);
  }
  const receiptsDirRel = argValue("--receipts-dir") ?? waveEntry.receipts_dir;
  if (!receiptsDirRel) {
    throw new Error(`DIAGNOSTIC: no receipts_dir for wave ${waveId}`);
  }
  const RECEIPTS_DIR = join(REPO_ROOT, receiptsDirRel);
  await mkdir(RECEIPTS_DIR, { recursive: true });
  const receipt_paths: string[] = [];
  const clientId = wave.client_id;

  for (const row of wave.sidecars) {
    const entry = fleetWaveEntryToManifestEntry(row, clientId, wave.wave_id);
    const { report } = await analyzeSidecarEntry(entry, DEFAULT_G3_FLEET_OPTIONS);
    const receipt = buildConstraintMigrationReceipt(
      report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      fleetReceiptContext(entry.sidecar_path, entry.token, {
        manifest_entry_id: entry.id,
      }),
      DEFAULT_G3_FLEET_OPTIONS,
    );
    const outName = `${row.impl_token}.receipt.json`;
    const outPath = join(RECEIPTS_DIR, outName);
    await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    receipt_paths.push(outPath);
    console.log(`TRACE: G3 receipt ${outName} layer_c.ok=${receipt.layer_c.ok}`);
  }

  const summary = {
    run_at: new Date().toISOString(),
    mode: "fleet-g3-receipts",
    wave_id: wave.wave_id,
    partition_wave_id: waveId,
    gate_stage: "G3",
    receipt_count: receipt_paths.length,
    receipt_paths: receipt_paths.map((p) => p.replace(`${REPO_ROOT}/`, "")),
  };
  await writeFile(
    join(RECEIPTS_DIR, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  const summariesDir = join(RECEIPTS_DIR, "summaries");
  await mkdir(summariesDir, { recursive: true });
  await writeFile(
    join(summariesDir, `${waveId}.json`),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  const validation = await validateReceiptSample(receipt_paths.slice(0, 3));
  console.log(`TRACE: schema validation sample ok=${validation.ok}`);
  if (!validation.ok) {
    console.error(JSON.stringify(validation, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
