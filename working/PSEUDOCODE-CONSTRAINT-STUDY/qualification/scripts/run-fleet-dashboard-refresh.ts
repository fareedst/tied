#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Refresh fleet-dashboard.v1.yaml from manifest + partition + stop/go + waivers.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildFleetDashboard,
  type ClientInventoryManifest,
  writeFleetDashboardYaml,
} from "./lib/fleet-dashboard-build.ts";
import { loadFleetWavePartition } from "./lib/fleet-wave-partition.ts";
import { loadWaveStopGoLog } from "./lib/fleet-wave-stop-go.ts";
import { loadWaiverRegistry } from "./lib/fleet-waiver-registry.ts";
import { yaml } from "./lib/yaml-io.ts";

async function main(): Promise<void> {
  const manifestPath = join(
    REPO_ROOT,
    "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml",
  );
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = yaml.load(manifestRaw) as ClientInventoryManifest;
  const partition = await loadFleetWavePartition();
  const stopGoLog = await loadWaveStopGoLog();
  const waiverRegistry = await loadWaiverRegistry();
  const doc = buildFleetDashboard({
    manifest,
    partition,
    stopGoLog,
    waiverRegistry,
  });
  const outRel = await writeFleetDashboardYaml(doc);
  console.log(
    JSON.stringify({
      ok: true,
      dashboard_path: outRel,
      wave_summary: doc.wave_summary,
      enrollment_summary: doc.enrollment_summary,
      stop_go_records: stopGoLog.length,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
