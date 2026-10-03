#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — stdd constraint-ready assist (Layer B Contract stubs).
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT, STDD_PROJECT_SIDECARS_ROOT } from "./lib/constants.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G3_FLEET_OPTIONS,
  fleetReceiptContext,
} from "./lib/constraint-migration-receipt.ts";
import {
  applyConstraintReadyPlannedActions,
  computeConstraintReadyDryRunHash,
  hashMatchesConstraintReadyDoc,
  planConstraintReadyActionForSidecar,
  type ConstraintReadyDryRunDocument,
  type PlannedConstraintReadyAction,
} from "./lib/fleet-constraint-ready-assist.ts";
import {
  classifySidecarText,
  emptySidecarCounts,
  type SidecarCountsByState,
} from "./lib/fleet-inventory-merge.ts";
import {
  getWaveById,
  loadFleetWavePartition,
  type FleetWaveEntry,
} from "./lib/fleet-wave-partition.ts";
import {
  fleetWaveEntryToManifestEntry,
  readWaveSidecarList,
  resolveSidecarAbsPath,
  type WaveSidecar,
} from "./lib/pilot-wave.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

const DRY_RUN_BASE = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/waves/stdd/dry-run",
);
const SNAPSHOT_SUBDIR = "snapshots-constraint-ready";
const STDD_CLIENT_ID = "stdd";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function loadSidecarsForWave(waveId: string): Promise<{
  wave_scope: string;
  sidecars: WaveSidecar[];
  client_id: string;
}> {
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const waveEntry = getWaveById(partition, waveId);
  if (!waveEntry.sidecar_list_path) {
    throw new Error(`DIAGNOSTIC: wave ${waveId} missing sidecar_list_path`);
  }
  const wave = await readWaveSidecarList(waveEntry.sidecar_list_path);
  return { wave_scope: waveId, sidecars: wave.sidecars, client_id: wave.client_id };
}

async function loadAllStddSidecarsFromWaves(): Promise<{
  wave_scope: string;
  sidecars: WaveSidecar[];
  client_id: string;
}> {
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const stddWaves = partition.waves.filter(
    (w) => w.client_ids.includes(STDD_CLIENT_ID) && w.sidecar_list_path,
  );
  const byToken = new Map<string, WaveSidecar>();
  for (const wave of stddWaves) {
    const list = await readWaveSidecarList(wave.sidecar_list_path!);
    for (const row of list.sidecars) {
      byToken.set(row.impl_token, row);
    }
  }
  const sidecars = [...byToken.values()].sort((a, b) =>
    a.impl_token.localeCompare(b.impl_token),
  );
  console.log(`TRACE: all-stdd-waves union => ${sidecars.length} sidecars`);
  return { wave_scope: "all", sidecars, client_id: STDD_CLIENT_ID };
}

async function loadAllStddSidecarsFromDisk(): Promise<WaveSidecar[]> {
  const entries = await readdir(STDD_PROJECT_SIDECARS_ROOT);
  const sidecars: WaveSidecar[] = [];
  for (const name of entries.sort()) {
    if (!name.endsWith("-pseudocode.md")) continue;
    const impl_token = name.replace(/-pseudocode\.md$/, "");
    sidecars.push({
      impl_token,
      sidecar_path: `tied/implementation-decisions/${name}`,
    });
  }
  return sidecars;
}

async function planForSidecarRows(rows: WaveSidecar[]): Promise<PlannedConstraintReadyAction[]> {
  const actions: PlannedConstraintReadyAction[] = [];
  for (const row of rows) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    actions.push(planConstraintReadyActionForSidecar(row.sidecar_path, row.impl_token, text));
  }
  return actions;
}

function dryRunOutputPath(waveScope: string): string {
  const safe = waveScope.replace(/[^a-zA-Z0-9.-]+/g, "-");
  return join(DRY_RUN_BASE, `constraint-ready-${safe}.v1.json`);
}

async function writeDryRunDoc(
  doc: ConstraintReadyDryRunDocument,
  waveScope: string,
): Promise<string> {
  await mkdir(DRY_RUN_BASE, { recursive: true });
  const outPath = dryRunOutputPath(waveScope);
  await writeFile(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  return outPath;
}

async function emitG3ReceiptsForWave(waveEntry: FleetWaveEntry): Promise<number> {
  if (!waveEntry.sidecar_list_path || !waveEntry.receipts_dir) {
    console.log(`TRACE: skip receipts ${waveEntry.wave_id} missing paths`);
    return 0;
  }
  const wave = await readWaveSidecarList(waveEntry.sidecar_list_path);
  if (wave.sidecars.length === 0) return 0;
  const RECEIPTS_DIR = join(REPO_ROOT, waveEntry.receipts_dir);
  await mkdir(RECEIPTS_DIR, { recursive: true });
  let count = 0;
  for (const row of wave.sidecars) {
    const entry = fleetWaveEntryToManifestEntry(row, wave.client_id, wave.wave_id);
    const { report } = await analyzeSidecarEntry(entry, DEFAULT_G3_FLEET_OPTIONS);
    const receipt = buildConstraintMigrationReceipt(
      report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      fleetReceiptContext(entry.sidecar_path, entry.token, {
        manifest_entry_id: entry.id,
      }),
      DEFAULT_G3_FLEET_OPTIONS,
    );
    const outPath = join(RECEIPTS_DIR, `${row.impl_token}.receipt.json`);
    await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    count += 1;
    console.log(`TRACE: G3 receipt refresh ${row.impl_token} layer_c.ok=${receipt.layer_c.ok}`);
  }
  const summary = {
    run_at: new Date().toISOString(),
    mode: "fleet-g3-constraint-ready-receipts",
    wave_id: wave.wave_id,
    partition_wave_id: waveEntry.wave_id,
    gate_stage: "G3",
    receipt_count: count,
  };
  await mkdir(join(RECEIPTS_DIR, "summaries"), { recursive: true });
  await writeFile(
    join(RECEIPTS_DIR, "summaries", `${waveEntry.wave_id}.json`),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  if (count > 0) {
    const samplePaths = wave.sidecars.slice(0, 3).map((row) =>
      join(RECEIPTS_DIR, `${row.impl_token}.receipt.json`),
    );
    const validation = await validateReceiptSample(samplePaths);
    console.log(`TRACE: receipt schema sample ok=${validation.ok}`);
  }
  return count;
}

async function runReport(): Promise<void> {
  const sidecars = await loadAllStddSidecarsFromDisk();
  const counts: SidecarCountsByState = emptySidecarCounts();
  let insert = 0;
  let manual = 0;
  let none = 0;
  for (const row of sidecars) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    const state = classifySidecarText(text);
    counts[state] += 1;
    const plan = planConstraintReadyActionForSidecar(row.sidecar_path, row.impl_token, text);
    if (plan.action === "insert_minimal_procedure_contract") insert += 1;
    else if (plan.action === "flag_manual_contract_migration") manual += 1;
    else none += 1;
  }
  console.log(
    JSON.stringify(
      {
        mode: "constraint-ready-report",
        scanned: sidecars.length,
        sidecar_counts_by_state: counts,
        assist_actions: {
          insert_minimal_procedure_contract: insert,
          flag_manual_contract_migration: manual,
          none,
        },
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  const allWaves = hasFlag("--all-waves");
  const report = hasFlag("--report");
  const apply = hasFlag("--apply");
  const force = hasFlag("--force");
  const receipts = hasFlag("--receipts");

  if (report) {
    await runReport();
    return;
  }

  if (!waveId && !allWaves) {
    console.error(
      "Usage: run-fleet-stdd-constraint-ready.ts (--report | --wave-id W-stdd-N | --all-waves) [--dry-run default] [--apply] [--force] [--receipts]",
    );
    process.exit(1);
  }
  if (waveId && allWaves) {
    throw new Error("DIAGNOSTIC: use either --wave-id or --all-waves, not both");
  }

  const loaded = waveId
    ? await loadSidecarsForWave(waveId)
    : await loadAllStddSidecarsFromWaves();
  const actions = await planForSidecarRows(loaded.sidecars);
  const dry_run_content_hash = computeConstraintReadyDryRunHash(actions);
  const outPath = dryRunOutputPath(loaded.wave_scope);

  if (apply) {
    let prior: ConstraintReadyDryRunDocument | undefined;
    try {
      prior = JSON.parse(await readFile(outPath, "utf8")) as ConstraintReadyDryRunDocument;
    } catch {
      if (!force) {
        throw new Error(
          `DIAGNOSTIC: missing dry-run at ${outPath}; run without --apply first or use --force`,
        );
      }
    }
    if (prior && !force && !hashMatchesConstraintReadyDoc(actions, prior)) {
      throw new Error(
        "DIAGNOSTIC: dry_run_content_hash mismatch — re-run dry-run or pass --force",
      );
    }
    const snapDir = join(
      DRY_RUN_BASE,
      SNAPSHOT_SUBDIR,
      loaded.wave_scope.replace(/\//g, "-"),
    );
    const result = await applyConstraintReadyPlannedActions({
      repositoryRoot: REPO_ROOT,
      actions,
      snapshotDir: snapDir,
    });
    const applyDoc: ConstraintReadyDryRunDocument = {
      schema_version: "constraint-ready-diff.v1",
      generated_at: new Date().toISOString(),
      client_id: loaded.client_id,
      wave_scope: loaded.wave_scope,
      methodology_pin: METHODOLOGY_PIN_LABEL,
      apply_mode: true,
      planned_actions: actions,
      dry_run_content_hash,
      snapshot_dir: snapDir.replace(`${REPO_ROOT}/`, ""),
    };
    await writeDryRunDoc(applyDoc, loaded.wave_scope);
    console.log(
      `TRACE: constraint-ready apply complete modified=${result.modified_paths.length} snapshots=${result.snapshot_paths.length}`,
    );
    if (receipts && waveId) {
      const partition = await loadFleetWavePartition(
        join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml"),
      );
      const waveEntry = getWaveById(partition, waveId);
      const n = await emitG3ReceiptsForWave(waveEntry);
      console.log(`TRACE: receipts refreshed wave=${waveId} count=${n}`);
    }
  } else {
    const doc: ConstraintReadyDryRunDocument = {
      schema_version: "constraint-ready-diff.v1",
      generated_at: new Date().toISOString(),
      client_id: loaded.client_id,
      wave_scope: loaded.wave_scope,
      methodology_pin: METHODOLOGY_PIN_LABEL,
      apply_mode: false,
      planned_actions: actions,
      dry_run_content_hash,
    };
    const written = await writeDryRunDoc(doc, loaded.wave_scope);
    const insertCount = actions.filter(
      (a) => a.action === "insert_minimal_procedure_contract",
    ).length;
    const manualCount = actions.filter(
      (a) => a.action === "flag_manual_contract_migration",
    ).length;
    console.log(
      `TRACE: dry-run written ${written} hash=${dry_run_content_hash} insert=${insertCount} manual_flag=${manualCount}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
