#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — orchestrate one G3 fleet wave (receipt batch).
 */
import { join } from "node:path";
import { execSync } from "node:child_process";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  getWaveById,
  loadFleetWavePartition,
} from "./lib/fleet-wave-partition.ts";
import { readWaveSidecarList } from "./lib/pilot-wave.ts";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  if (!waveId) {
    console.error("Usage: run-fleet-g3-wave.ts --wave-id W-stdd-2 [--partition PATH] [--dry-run]");
    process.exit(1);
  }
  const dryRun = process.argv.includes("--dry-run");
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const waveEntry = getWaveById(partition, waveId);
  if (waveEntry.gate_stage !== "G3") {
    throw new Error(`DIAGNOSTIC: wave ${waveId} is ${waveEntry.gate_stage}; expected G3`);
  }
  if (!waveEntry.sidecar_list_path) {
    throw new Error(`DIAGNOSTIC: wave ${waveId} missing sidecar_list_path`);
  }
  const wave = await readWaveSidecarList(waveEntry.sidecar_list_path);
  console.log(
    `TRACE: fleet-g3-wave ${waveId} sidecars=${wave.sidecars.length} dry_run=${dryRun}`,
  );
  if (wave.sidecars.length === 0) {
    console.error(`TRACE: empty sidecar list for ${waveId}`);
    process.exit(1);
  }
  if (dryRun) {
    for (const row of wave.sidecars) {
      console.log(`DEBUG: dry-run would analyze ${row.impl_token} ${row.sidecar_path}`);
    }
    return;
  }
  const script = join(
    REPO_ROOT,
    "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-g3-receipts.ts",
  );
  const args = [
    "node",
    "--experimental-strip-types",
    script,
    "--wave-id",
    waveId,
    "--partition",
    partitionPath,
  ];
  if (waveEntry.receipts_dir) {
    args.push("--receipts-dir", waveEntry.receipts_dir);
  }
  execSync(args.join(" "), { cwd: REPO_ROOT, stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
