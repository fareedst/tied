/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — fleet dashboard rollup builder.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildEnrollmentSummary,
  buildFleetDashboard,
  buildWaveSummary,
  rollupSidecarsFromManifest,
} from "./fleet-dashboard-build.ts";
import type { FleetWavePartition } from "./fleet-wave-partition.ts";
import type { MigrationWaiverRegistry } from "./fleet-waiver-registry.ts";

const manifest = {
  clients: [
    {
      client_id: "stdd",
      phase_4_enrollment: "enrolled_phase_4",
      aggregate_migration_state: "constraint-ready-v2",
      sidecar_counts_by_state: {
        "legacy-v1": 1,
        "header-only-v2": 2,
        "constraint-ready-v2": 3,
        "constraint-enforced-v2": 0,
        "unknown-or-mixed": 0,
      },
    },
    {
      client_id: "1786636023",
      phase_4_enrollment: "not_enrolled_phase_4",
      aggregate_migration_state: "header-only-v2",
      sidecar_counts_by_state: {
        "legacy-v1": 0,
        "header-only-v2": 1,
        "constraint-ready-v2": 0,
        "constraint-enforced-v2": 0,
        "unknown-or-mixed": 0,
      },
    },
  ],
};

const partition: FleetWavePartition = {
  schema_version: 1,
  partition_id: "test-partition",
  methodology_pin: "48d1fbb+",
  program_gate_policy: "advisory",
  gate_promotion_stages_ref: "working/fleet-constraint-v2/gate-promotion-stages.v1.yaml",
  updated_at: "2026-09-12T00:00:00Z",
  waves: [
    {
      wave_id: "W-a",
      client_ids: ["stdd"],
      gate_stage: "G3",
      wave_status: "complete",
      sidecar_list_path: "x",
      receipts_dir: "y",
    },
    {
      wave_id: "W-b",
      client_ids: ["stdd"],
      gate_stage: "G3",
      wave_status: "pending",
      sidecar_list_path: "x",
      receipts_dir: "y",
    },
  ],
};

const waiverRegistry: MigrationWaiverRegistry = {
  schema_version: 1,
  registry_id: "test",
  updated_at: "2026-09-12T00:00:00Z",
  waivers: [],
};

test("buildEnrollmentSummary counts enrolled vs not", () => {
  const summary = buildEnrollmentSummary(manifest);
  assert.equal(summary.enrolled_phase_4_count, 1);
  assert.equal(summary.not_enrolled_phase_4_count, 1);
  assert.deepEqual(summary.enrolled_client_ids, ["stdd"]);
});

test("rollupSidecarsFromManifest sums sidecar states", () => {
  const rollups = rollupSidecarsFromManifest(manifest);
  assert.equal(rollups["header-only-v2"], 3);
  assert.equal(rollups["constraint-ready-v2"], 3);
});

test("buildWaveSummary from partition wave_status", () => {
  const ws = buildWaveSummary(partition);
  assert.equal(ws.total_waves, 2);
  assert.equal(ws.complete, 1);
  assert.equal(ws.pending, 1);
});

test("buildFleetDashboard integrates stop/go last record id", () => {
  const doc = buildFleetDashboard({
    manifest,
    partition,
    stopGoLog: [
      {
        schema_version: 1,
        record_id: "rec-1",
        wave_id: "W-a",
        client_ids: ["stdd"],
        gate_stage: "G3",
        disposition: "go",
        decided_at: "2026-09-12T12:00:00Z",
        methodology_pin: "48d1fbb+",
      },
    ],
    waiverRegistry,
    asOf: new Date("2026-09-12T18:00:00Z"),
  });
  assert.equal(doc.wave_summary.last_stop_go_record_id, "rec-1");
  assert.equal(doc.inventory_rollups.active_waiver_count, 0);
  assert.equal(doc.enrollment_summary.enrolled_phase_4_count, 1);
});
