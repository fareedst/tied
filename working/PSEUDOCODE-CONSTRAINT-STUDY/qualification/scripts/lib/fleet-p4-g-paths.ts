/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Receipt summary paths for stop/go close-out.
 */
import { access } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./constants.ts";
import type { FleetWaveEntry } from "./fleet-wave-partition.ts";

export async function resolveReceiptSummaryPath(
  wave: FleetWaveEntry,
): Promise<string | undefined> {
  const candidates: string[] = [];
  if (wave.wave_id === "W-stdd-1") {
    candidates.push("working/fleet-constraint-v2/pilots/stdd/receipts/summary.json");
  }
  if (wave.receipts_dir) {
    candidates.push(
      `${wave.receipts_dir}/summaries/${wave.wave_id}.json`.replace(/\/+/g, "/"),
    );
    candidates.push(`${wave.receipts_dir}/summary.json`.replace(/\/+/g, "/"));
  }
  for (const rel of candidates) {
    const abs = join(REPO_ROOT, rel);
    try {
      await access(abs);
      return rel;
    } catch {
      // try next
    }
  }
  return undefined;
}
