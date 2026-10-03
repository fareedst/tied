/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — fleet wave partition loader.
 */
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { REPO_ROOT } from "./constants.ts";
import {
  getWaveById,
  loadFleetWavePartition,
  validateWaveEntry,
} from "./fleet-wave-partition.ts";

const PARTITION = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml",
);

test("loadFleetWavePartition loads stdd partition", async () => {
  const partition = await loadFleetWavePartition(PARTITION);
  assert.equal(partition.schema_version, 1);
  assert.equal(partition.partition_id, "stdd-fleet-wave-partition-v1");
  assert.ok(partition.waves.length >= 10);
});

test("getWaveById returns W-stdd-2 with sidecar list", async () => {
  const partition = await loadFleetWavePartition(PARTITION);
  const wave = getWaveById(partition, "W-stdd-2");
  assert.equal(wave.wave_id, "W-stdd-2");
  assert.equal(wave.gate_stage, "G3");
  assert.ok(wave.sidecar_list_path?.includes("wave-2-sidecars.yaml"));
});

test("getWaveById returns W-stdd-stragglers-WS0 with sidecar list", async () => {
  const partition = await loadFleetWavePartition(PARTITION);
  const wave = getWaveById(partition, "W-stdd-stragglers-WS0");
  assert.equal(wave.gate_stage, "G3");
  assert.ok(wave.sidecar_list_path?.includes("wave-stragglers-sidecars.yaml"));
});

test("getWaveById throws for unknown wave", async () => {
  const partition = await loadFleetWavePartition(PARTITION);
  assert.throws(() => getWaveById(partition, "W-missing"), /not found/);
});

test("validateWaveEntry rejects G3 wave without sidecar_list_path", () => {
  assert.throws(
    () =>
      validateWaveEntry({
        wave_id: "W-x",
        client_ids: ["stdd"],
        gate_stage: "G3",
        wave_status: "pending",
      }),
    /sidecar_list_path/,
  );
});
