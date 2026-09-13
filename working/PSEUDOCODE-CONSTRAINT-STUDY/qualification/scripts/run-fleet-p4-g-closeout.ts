#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] P4-G composition — go records, waiver check, dashboard refresh.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildFleetDashboard,
  type ClientInventoryManifest,
  writeFleetDashboardYaml,
} from "./lib/fleet-dashboard-build.ts";
import { resolveReceiptSummaryPath } from "./lib/fleet-p4-g-paths.ts";
import {
  appendWaveStopGo,
  hasStopGoForWave,
  loadWaveStopGoLog,
} from "./lib/fleet-wave-stop-go.ts";
import {
  loadFleetWavePartition,
  type FleetWaveEntry,
  type FleetWavePartition,
} from "./lib/fleet-wave-partition.ts";
import { assertNoBlockingWaivers, loadWaiverRegistry } from "./lib/fleet-waiver-registry.ts";
import { yaml } from "./lib/yaml-io.ts";

const PARTITION_PATH = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml",
);
const F11_THRESHOLDS = "working/fleet-constraint-v2/f11-fp-thresholds.v1.yaml";

async function maybeMarkWaveComplete(
  partition: FleetWavePartition,
  wave: FleetWaveEntry,
  summaryPath: string,
  stopGoAppended: boolean,
): Promise<boolean> {
  if (wave.wave_status === "complete") return false;
  if (!stopGoAppended && !hasStopGoForWave(await loadWaveStopGoLog(), wave.wave_id)) {
    return false;
  }
  if (!summaryPath) return false;
  wave.wave_status = "complete";
  if (!wave.notes?.includes("P4-G close-out")) {
    wave.notes = [wave.notes, "P4-G close-out: receipts + go stop/go on file."].filter(Boolean).join("\n");
  }
  partition.updated_at = new Date().toISOString();
  return true;
}

async function appendGoIfNeeded(
  wave: FleetWaveEntry,
  summaryPath: string,
): Promise<{ appended: boolean; record_id?: string }> {
  const log = await loadWaveStopGoLog();
  if (hasStopGoForWave(log, wave.wave_id)) {
    return { appended: false };
  }
  const { record } = await appendWaveStopGo({
    wave_id: wave.wave_id,
    client_ids: wave.client_ids,
    gate_stage: wave.gate_stage,
    disposition: "go",
    receipt_summary_path: summaryPath,
    methodology_pin: wave.methodology_pin ?? undefined,
    notes: "P4-G fleet close-out composition",
    operator: "run-fleet-p4-g-closeout",
  });
  return { appended: true, record_id: record.record_id };
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  let partition = await loadFleetWavePartition(PARTITION_PATH);
  const waiverRegistry = await loadWaiverRegistry();
  const waiverCheck = assertNoBlockingWaivers(waiverRegistry);
  if (!waiverCheck.ok) {
    console.error(JSON.stringify({ ok: false, step: "waiver_check", ...waiverCheck }));
    process.exit(1);
  }

  const appended: Array<{ wave_id: string; record_id?: string; summary?: string }> = [];
  let partitionMutated = false;

  for (const wave of partition.waves) {
    const summaryPath = await resolveReceiptSummaryPath(wave);
    const eligible =
      wave.wave_status === "complete" ||
      (summaryPath !== undefined && wave.gate_stage === "G3");
    if (!eligible || !summaryPath) continue;

    if (dryRun) {
      const log = await loadWaveStopGoLog();
      if (!hasStopGoForWave(log, wave.wave_id)) {
        appended.push({ wave_id: wave.wave_id, summary: summaryPath });
      }
      continue;
    }

    const goResult = await appendGoIfNeeded(wave, summaryPath);
    if (goResult.appended) {
      appended.push({
        wave_id: wave.wave_id,
        record_id: goResult.record_id,
        summary: summaryPath,
      });
    }
    const marked = await maybeMarkWaveComplete(
      partition,
      wave,
      summaryPath,
      goResult.appended,
    );
    if (marked) partitionMutated = true;
  }

  if (partitionMutated && !dryRun) {
    const body = yaml.dump(partition, { lineWidth: 120, noRefs: true, sortKeys: false });
    await writeFile(PARTITION_PATH, body, "utf8");
  }

  if (!dryRun) {
    const manifestRaw = await readFile(
      join(REPO_ROOT, "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml"),
      "utf8",
    );
    const manifest = yaml.load(manifestRaw) as ClientInventoryManifest;
    partition = await loadFleetWavePartition(PARTITION_PATH);
    const stopGoLog = await loadWaveStopGoLog();
    const doc = buildFleetDashboard({
      manifest,
      partition,
      stopGoLog,
      waiverRegistry,
      sources: { f11_fp_thresholds_path: F11_THRESHOLDS },
    });
    await writeFleetDashboardYaml(doc);
  }

  const finalLog = await loadWaveStopGoLog();
  console.log(
    JSON.stringify({
      ok: true,
      dry_run: dryRun,
      stop_go_record_count: finalLog.length,
      appended_this_run: appended,
      f11_fp_thresholds_ref: F11_THRESHOLDS,
      partition_updated: partitionMutated,
      wave_complete_count: partition.waves.filter((w) => w.wave_status === "complete").length,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
