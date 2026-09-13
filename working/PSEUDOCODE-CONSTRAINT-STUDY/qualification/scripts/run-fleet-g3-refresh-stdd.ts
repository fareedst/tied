#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — refresh stdd G3 receipts for all partition G3 sub-waves.
 */
import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  getWaveById,
  loadFleetWavePartition,
  type FleetWaveEntry,
} from "./lib/fleet-wave-partition.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

const STDD_RECEIPTS_DIR = "working/fleet-constraint-v2/waves/stdd/receipts";
const DEFAULT_PARTITION = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml",
);
const G3_RECEIPTS_SCRIPT = join(
  REPO_ROOT,
  "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-g3-receipts.ts",
);

const EXTERNAL_G3_WAVES = [
  "W-ext-1789177584-1",
  "W-ext-1789136889-1",
  "W-ext-1789147101-1",
  "W-ext-1789069630-1",
] as const;

export type WaveReceiptSummary = {
  run_at: string;
  mode: string;
  wave_id: string;
  partition_wave_id: string;
  gate_stage: string;
  receipt_count: number;
  receipt_paths: string[];
};

export type StddG3AggregateSummary = {
  run_at: string;
  mode: "fleet-g3-receipts-aggregate";
  gate_stage: "G3";
  methodology_pin: string;
  receipt_count: number;
  wave_receipt_counts: Record<string, number>;
  receipt_paths: string[];
  waves_refreshed: string[];
};

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function stddG3WaveNumericSuffix(waveId: string): number {
  const m = waveId.match(/^W-stdd-(\d+)$/);
  return m ? Number.parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

function stddG3WaveIds(partition: Awaited<ReturnType<typeof loadFleetWavePartition>>): string[] {
  return partition.waves
    .filter(
      (w) =>
        w.client_ids.includes("stdd") &&
        w.gate_stage === "G3" &&
        w.wave_id !== "W-stdd-1" &&
        w.sidecar_list_path,
    )
    .map((w) => w.wave_id)
    .sort((a, b) => {
      const na = stddG3WaveNumericSuffix(a);
      const nb = stddG3WaveNumericSuffix(b);
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });
}

function runG3ReceiptsForWave(waveId: string, partitionPath: string): void {
  execSync(
    [
      "node",
      "--experimental-strip-types",
      G3_RECEIPTS_SCRIPT,
      "--wave-id",
      waveId,
      "--partition",
      partitionPath,
    ].join(" "),
    { cwd: REPO_ROOT, stdio: "inherit" },
  );
}

export async function readWaveSummaryJson(
  waveId: string,
  receiptsDirRel = STDD_RECEIPTS_DIR,
): Promise<WaveReceiptSummary> {
  const path = join(REPO_ROOT, receiptsDirRel, "summaries", `${waveId}.json`);
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as WaveReceiptSummary;
}

export async function buildStddG3AggregateSummary(
  waveIds: string[],
  methodologyPin: string,
  receiptsDirRel = STDD_RECEIPTS_DIR,
): Promise<StddG3AggregateSummary> {
  const wave_receipt_counts: Record<string, number> = {};
  const receipt_paths: string[] = [];
  for (const waveId of waveIds) {
    const summary = await readWaveSummaryJson(waveId, receiptsDirRel);
    wave_receipt_counts[waveId] = summary.receipt_count;
    for (const p of summary.receipt_paths) {
      if (!receipt_paths.includes(p)) receipt_paths.push(p);
    }
  }
  return {
    run_at: new Date().toISOString(),
    mode: "fleet-g3-receipts-aggregate",
    gate_stage: "G3",
    methodology_pin: methodologyPin,
    receipt_count: receipt_paths.length,
    wave_receipt_counts,
    receipt_paths,
    waves_refreshed: [...waveIds],
  };
}

export async function countLayerCOk(receiptPathsRel: string[]): Promise<{
  layer_c_ok_true: number;
  layer_c_ok_false: number;
}> {
  let layer_c_ok_true = 0;
  let layer_c_ok_false = 0;
  for (const rel of receiptPathsRel) {
    const raw = await readFile(join(REPO_ROOT, rel), "utf8");
    const doc = JSON.parse(raw) as { layer_c?: { ok?: boolean } };
    if (doc.layer_c?.ok === true) layer_c_ok_true += 1;
    else layer_c_ok_false += 1;
  }
  return { layer_c_ok_true, layer_c_ok_false };
}

async function main(): Promise<void> {
  const partitionPath = DEFAULT_PARTITION;
  const partition = await loadFleetWavePartition(partitionPath);
  const includeExternal = hasFlag("--include-external");
  const dryRun = hasFlag("--dry-run");

  const stddWaveIds = stddG3WaveIds(partition);
  if (stddWaveIds.length === 0) {
    throw new Error("DIAGNOSTIC: no stdd G3 waves found in partition");
  }

  console.log(
    `TRACE: fleet-g3-refresh-stdd waves=${stddWaveIds.join(",")} dry_run=${dryRun} external=${includeExternal}`,
  );

  if (dryRun) {
    for (const waveId of stddWaveIds) {
      const w = getWaveById(partition, waveId);
      console.log(`DEBUG: dry-run would refresh ${waveId} list=${w.sidecar_list_path}`);
    }
    if (includeExternal) {
      for (const waveId of EXTERNAL_G3_WAVES) {
        console.log(`DEBUG: dry-run would refresh external ${waveId}`);
      }
    }
    return;
  }

  for (const waveId of stddWaveIds) {
    runG3ReceiptsForWave(waveId, partitionPath);
  }

  const aggregate = await buildStddG3AggregateSummary(
    stddWaveIds,
    partition.methodology_pin,
  );
  const aggregatePath = join(REPO_ROOT, STDD_RECEIPTS_DIR, "summary.json");
  await writeFile(aggregatePath, `${JSON.stringify(aggregate, null, 2)}\n`, "utf8");
  console.log(
    `TRACE: aggregate summary receipt_count=${aggregate.receipt_count} path=${STDD_RECEIPTS_DIR}/summary.json`,
  );

  const layerStats = await countLayerCOk(aggregate.receipt_paths);
  console.log(`TRACE: layer_c.ok true=${layerStats.layer_c_ok_true} false=${layerStats.layer_c_ok_false}`);

  const samplePaths = aggregate.receipt_paths.slice(0, 3).map((p) => join(REPO_ROOT, p));
  const validation = await validateReceiptSample(samplePaths);
  console.log(`TRACE: aggregate schema validation sample ok=${validation.ok}`);
  if (!validation.ok) {
    console.error(JSON.stringify(validation, null, 2));
    process.exit(1);
  }

  if (includeExternal) {
    for (const waveId of EXTERNAL_G3_WAVES) {
      const w = getWaveById(partition, waveId) as FleetWaveEntry;
      if (w.gate_stage !== "G3") {
        console.log(`TRACE: skip external ${waveId} gate=${w.gate_stage}`);
        continue;
      }
      runG3ReceiptsForWave(waveId, partitionPath);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "fleet-g3-refresh-stdd",
        wave_receipt_counts: aggregate.wave_receipt_counts,
        receipt_count: aggregate.receipt_count,
        layer_c: layerStats,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
