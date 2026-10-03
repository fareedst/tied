#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 3 — emit G2 pilot receipts for stdd wave 1.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G2_PILOT_VERIFICATION_BLOCKING,
  pilotReceiptContext,
} from "./lib/constraint-migration-receipt.ts";
import { readStddWave1, waveEntryToManifestEntry } from "./lib/pilot-wave.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

const RECEIPTS_DIR = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/pilots/stdd/receipts",
);

async function main(): Promise<void> {
  const wave = await readStddWave1();
  await mkdir(RECEIPTS_DIR, { recursive: true });
  const receipt_paths: string[] = [];

  for (const row of wave.sidecars) {
    const entry = waveEntryToManifestEntry(row);
    const { report } = await analyzeSidecarEntry(entry, {
      gate_mode: true,
      typed_flow: true,
      constraint_flow: true,
      constraint_gate_errors: true,
      include_structural_compat: true,
    });
    const receipt = buildConstraintMigrationReceipt(
      report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      pilotReceiptContext(entry.sidecar_path, entry.token, {
        manifest_entry_id: entry.id,
        layer_a_applicable: true,
      }),
      DEFAULT_G2_PILOT_VERIFICATION_BLOCKING,
    );
    const outName = `${row.impl_token}.receipt.json`;
    const outPath = join(RECEIPTS_DIR, outName);
    await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    receipt_paths.push(outPath);
    console.log(`TRACE: G2 receipt ${outName} layer_c.ok=${receipt.layer_c.ok}`);
  }

  const summary = {
    run_at: new Date().toISOString(),
    mode: "pilot-g2-receipts",
    wave_id: wave.wave_id,
    receipt_count: receipt_paths.length,
    receipt_paths: receipt_paths.map((p) => p.replace(`${REPO_ROOT}/`, "")),
  };
  await writeFile(
    join(RECEIPTS_DIR, "summary.json"),
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
