/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Load and validate fleet-wave-partition.v1.yaml.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./constants.ts";
import { yaml } from "./yaml-io.ts";

export type FleetWaveEntry = {
  wave_id: string;
  client_ids: string[];
  gate_stage: "G2" | "G3";
  wave_status: "complete" | "in_progress" | "pending" | "halted";
  sidecar_list_path?: string;
  receipts_dir?: string;
  depends_on_wave_ids?: string[];
  max_sidecars?: number;
  notes?: string;
  methodology_pin?: string;
};

export type FleetWavePartition = {
  schema_version: number;
  partition_id: string;
  methodology_pin: string;
  program_gate_policy: "advisory" | "blocking";
  gate_promotion_stages_ref: string;
  updated_at: string;
  waves: FleetWaveEntry[];
  notes?: string;
  $schema?: string;
};

const DEFAULT_PARTITION = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml",
);

export async function loadFleetWavePartition(
  path = DEFAULT_PARTITION,
): Promise<FleetWavePartition> {
  const raw = await readFile(path, "utf8");
  const doc = yaml.load(raw) as FleetWavePartition;
  if (doc.schema_version !== 1) {
    throw new Error(`DIAGNOSTIC: unsupported partition schema_version ${doc.schema_version}`);
  }
  if (!Array.isArray(doc.waves) || doc.waves.length < 1) {
    throw new Error("DIAGNOSTIC: partition waves must be non-empty");
  }
  for (const wave of doc.waves) {
    validateWaveEntry(wave);
  }
  return doc;
}

export function validateWaveEntry(wave: FleetWaveEntry): void {
  if (!wave.wave_id?.trim()) throw new Error("DIAGNOSTIC: wave_id required");
  if (!wave.client_ids?.length) throw new Error(`DIAGNOSTIC: ${wave.wave_id} client_ids required`);
  if (wave.gate_stage !== "G2" && wave.gate_stage !== "G3") {
    throw new Error(`DIAGNOSTIC: ${wave.wave_id} invalid gate_stage`);
  }
  if (
    wave.gate_stage === "G3" &&
    wave.wave_status !== "complete" &&
    wave.sidecar_list_path === undefined &&
    !wave.wave_id.startsWith("W-ext-")
  ) {
    // External pending waves may omit list until P4-F scan; stdd G3 waves require list path.
    if (wave.client_ids.includes("stdd")) {
      throw new Error(`DIAGNOSTIC: ${wave.wave_id} G3 stdd wave requires sidecar_list_path`);
    }
  }
  if (wave.gate_stage === "G3" && wave.client_ids.includes("stdd") && !wave.receipts_dir) {
    throw new Error(`DIAGNOSTIC: ${wave.wave_id} requires receipts_dir`);
  }
}

export function getWaveById(partition: FleetWavePartition, waveId: string): FleetWaveEntry {
  const wave = partition.waves.find((w) => w.wave_id === waveId);
  if (!wave) {
    throw new Error(`DIAGNOSTIC: wave_id not found: ${waveId}`);
  }
  return wave;
}
