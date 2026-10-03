/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Fleet dashboard rollup from manifest, partition, stop/go, waivers.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT } from "./constants.ts";
import type { FleetWavePartition } from "./fleet-wave-partition.ts";
import { emptySidecarCounts, type SidecarCountsByState } from "./fleet-inventory-merge.ts";
import type { WaveStopGoRecord } from "./fleet-wave-stop-go.ts";
import { listActiveWaivers, type MigrationWaiverRegistry } from "./fleet-waiver-registry.ts";
import { yaml } from "./yaml-io.ts";

export type ClientInventoryManifest = {
  schema_version?: number;
  clients: Array<{
    client_id: string;
    phase_4_enrollment?: string;
    aggregate_migration_state?: string;
    sidecar_counts_by_state?: SidecarCountsByState;
    [key: string]: unknown;
  }>;
  methodology_pin?: string;
  [key: string]: unknown;
};

export type FleetDashboardDocument = {
  schema_version: 1;
  $schema?: string;
  dashboard_id: string;
  generated_at: string;
  methodology_pin: string;
  program_gate_policy?: "advisory" | "blocking";
  sources: {
    inventory_manifest_path: string;
    wave_partition_path: string;
    waiver_registry_path: string;
    wave_stop_go_path: string;
    f11_fp_thresholds_path?: string;
  };
  enrollment_summary: {
    enrolled_phase_4_count: number;
    not_enrolled_phase_4_count: number;
    enrolled_client_ids?: string[];
  };
  wave_summary: {
    total_waves: number;
    complete: number;
    in_progress?: number;
    pending: number;
    halted: number;
    last_stop_go_record_id?: string;
  };
  inventory_rollups: {
    clients_by_aggregate_state?: Record<string, number>;
    sidecars_by_state?: SidecarCountsByState;
    active_waiver_count: number;
  };
  notes?: string;
};

export type BuildDashboardInput = {
  manifest: ClientInventoryManifest;
  partition: FleetWavePartition;
  stopGoLog: WaveStopGoRecord[];
  waiverRegistry: MigrationWaiverRegistry;
  asOf?: Date;
  sources?: Partial<FleetDashboardDocument["sources"]>;
  program_gate_policy?: "advisory" | "blocking";
};

const DEFAULT_SOURCES: FleetDashboardDocument["sources"] = {
  inventory_manifest_path: "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml",
  wave_partition_path: "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml",
  waiver_registry_path: "working/fleet-constraint-v2/migration-waiver-registry.v1.yaml",
  wave_stop_go_path: "working/fleet-constraint-v2/wave-stop-go.v1.json",
  f11_fp_thresholds_path: "working/fleet-constraint-v2/f11-fp-thresholds.v1.yaml",
};

export function rollupSidecarsFromManifest(
  manifest: ClientInventoryManifest,
): SidecarCountsByState {
  const totals = emptySidecarCounts();
  for (const row of manifest.clients) {
    const counts = row.sidecar_counts_by_state ?? emptySidecarCounts();
    for (const key of Object.keys(totals) as (keyof SidecarCountsByState)[]) {
      totals[key] += counts[key] ?? 0;
    }
  }
  return totals;
}

export function rollupClientsByAggregateState(
  manifest: ClientInventoryManifest,
): Record<string, number> {
  const byState: Record<string, number> = {};
  for (const row of manifest.clients) {
    const state = row.aggregate_migration_state ?? "unknown";
    byState[state] = (byState[state] ?? 0) + 1;
  }
  return byState;
}

export function buildEnrollmentSummary(manifest: ClientInventoryManifest): {
  enrolled_phase_4_count: number;
  not_enrolled_phase_4_count: number;
  enrolled_client_ids: string[];
} {
  let enrolled = 0;
  let notEnrolled = 0;
  const enrolledIds: string[] = [];
  for (const row of manifest.clients) {
    if (row.phase_4_enrollment === "enrolled_phase_4") {
      enrolled += 1;
      enrolledIds.push(row.client_id);
    } else {
      notEnrolled += 1;
    }
  }
  enrolledIds.sort();
  return {
    enrolled_phase_4_count: enrolled,
    not_enrolled_phase_4_count: notEnrolled,
    enrolled_client_ids: enrolledIds,
  };
}

export function buildWaveSummary(partition: FleetWavePartition): FleetDashboardDocument["wave_summary"] {
  let complete = 0;
  let pending = 0;
  let halted = 0;
  let inProgress = 0;
  for (const wave of partition.waves) {
    switch (wave.wave_status) {
      case "complete":
        complete += 1;
        break;
      case "halted":
        halted += 1;
        break;
      case "in_progress":
        inProgress += 1;
        break;
      default:
        pending += 1;
    }
  }
  return {
    total_waves: partition.waves.length,
    complete,
    in_progress: inProgress,
    pending,
    halted,
  };
}

export function buildFleetDashboard(input: BuildDashboardInput): FleetDashboardDocument {
  const asOf = input.asOf ?? new Date();
  const enrollment = buildEnrollmentSummary(input.manifest);
  const waveSummary = buildWaveSummary(input.partition);
  const lastRecord = input.stopGoLog[input.stopGoLog.length - 1];
  if (lastRecord) {
    waveSummary.last_stop_go_record_id = lastRecord.record_id;
  }
  const activeWaivers = listActiveWaivers(input.waiverRegistry, asOf);
  const sources = { ...DEFAULT_SOURCES, ...input.sources };
  return {
    schema_version: 1,
    $schema: "working/fleet-constraint-v2/fleet-dashboard.v1.schema.json",
    dashboard_id: "stdd-fleet-dashboard-v1",
    generated_at: asOf.toISOString(),
    methodology_pin: input.partition.methodology_pin ?? METHODOLOGY_PIN_LABEL,
    program_gate_policy: input.program_gate_policy ?? input.partition.program_gate_policy,
    sources,
    enrollment_summary: enrollment,
    wave_summary: waveSummary,
    inventory_rollups: {
      clients_by_aggregate_state: rollupClientsByAggregateState(input.manifest),
      sidecars_by_state: rollupSidecarsFromManifest(input.manifest),
      active_waiver_count: activeWaivers.length,
    },
    notes:
      "Refreshed by run-fleet-dashboard-refresh.ts / run-fleet-p4-g-closeout.ts (P4-G). Sidecar rollups from client-inventory-manifest.v1.yaml.",
  };
}

export async function writeFleetDashboardYaml(
  doc: FleetDashboardDocument,
  path = join(REPO_ROOT, "working/fleet-constraint-v2/fleet-dashboard.v1.yaml"),
): Promise<string> {
  const body = yaml.dump(doc, { lineWidth: 120, noRefs: true, sortKeys: false });
  await writeFile(path, body, "utf8");
  return path.replace(`${REPO_ROOT}/`, "");
}
