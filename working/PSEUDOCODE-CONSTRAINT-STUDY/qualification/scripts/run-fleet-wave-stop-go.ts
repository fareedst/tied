#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] CLI — append wave stop/go record (OD-P4-6).
 */
import { appendWaveStopGo } from "./lib/fleet-wave-stop-go.ts";
import { getWaveById, loadFleetWavePartition } from "./lib/fleet-wave-partition.ts";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function parseBlockingGaps(): string[] {
  const raw = argValue("--blocking-gaps");
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  const disposition = argValue("--disposition") as "go" | "stop" | "halt" | undefined;
  if (!waveId || !disposition) {
    console.error(
      "Usage: run-fleet-wave-stop-go.ts --wave-id W-stdd-2 --disposition go|stop|halt [--blocking-gaps a,b] [--receipt-summary PATH]",
    );
    process.exit(1);
  }
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const wave = getWaveById(partition, waveId);
  const f11Ref =
    disposition === "halt"
      ? "working/fleet-constraint-v2/f11-fp-thresholds.v1.yaml"
      : argValue("--f11-fp-thresholds");
  const { record, log_path } = await appendWaveStopGo({
    wave_id: waveId,
    client_ids: wave.client_ids,
    gate_stage: wave.gate_stage,
    disposition,
    blocking_evidence_gaps: parseBlockingGaps(),
    f11_fp_thresholds_ref: f11Ref,
    receipt_summary_path: argValue("--receipt-summary"),
    notes: argValue("--notes"),
    operator: argValue("--operator") ?? "run-fleet-wave-stop-go",
  });
  console.log(JSON.stringify({ ok: true, log_path, record_id: record.record_id, disposition: record.disposition }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
