#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — stdd fleet wave header apply (APPLY_MIGRATION_ASSIST).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT } from "./lib/constants.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G3_FLEET_OPTIONS,
  fleetReceiptContext,
} from "./lib/constraint-migration-receipt.ts";
import {
  applyPlannedActions,
  computeDryRunContentHash,
  hashMatchesDryRunDoc,
  planActionForSidecar,
  type ApplyDryRunDocument,
  type PlannedSidecarAction,
} from "./lib/fleet-migration-apply.ts";
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
const SNAPSHOT_SUBDIR = "snapshots";
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

async function loadAllLegacyFromStddWaves(): Promise<{
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
  const sidecars: WaveSidecar[] = [];
  for (const row of [...byToken.values()].sort((a, b) =>
    a.impl_token.localeCompare(b.impl_token),
  )) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    const plan = planActionForSidecar(row.sidecar_path, row.impl_token, text);
    if (plan.classification_before === "legacy-v1") {
      sidecars.push(row);
    }
  }
  console.log(
    `TRACE: all-legacy union from ${stddWaves.length} stdd waves => ${sidecars.length} legacy sidecars`,
  );
  return { wave_scope: "all-legacy", sidecars, client_id: STDD_CLIENT_ID };
}

async function planForSidecarRows(rows: WaveSidecar[]): Promise<PlannedSidecarAction[]> {
  const actions: PlannedSidecarAction[] = [];
  for (const row of rows) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    actions.push(planActionForSidecar(row.sidecar_path, row.impl_token, text));
  }
  return actions;
}

function dryRunOutputPath(waveScope: string): string {
  const safe = waveScope.replace(/[^a-zA-Z0-9.-]+/g, "-");
  return join(DRY_RUN_BASE, `apply-${safe}.v1.json`);
}

async function writeDryRunDoc(
  doc: ApplyDryRunDocument,
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
    mode: "fleet-g3-receipts-refresh",
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

async function refreshReceiptsForScope(
  waveScope: string,
  modifiedImplTokens: Set<string>,
): Promise<{ waves_refreshed: string[]; receipt_count: number }> {
  const partition = await loadFleetWavePartition(
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml"),
  );
  const stddWaves = partition.waves.filter(
    (w) =>
      w.client_ids.includes(STDD_CLIENT_ID) &&
      w.gate_stage === "G3" &&
      w.sidecar_list_path,
  );
  const wavesToRun: FleetWaveEntry[] = [];
  if (waveScope.startsWith("W-stdd-")) {
    wavesToRun.push(getWaveById(partition, waveScope));
  } else {
    for (const w of stddWaves) {
      const list = await readWaveSidecarList(w.sidecar_list_path!);
      const touches = list.sidecars.some((row) => modifiedImplTokens.has(row.impl_token));
      const isContinuationWave = /^W-stdd-(?:[3-9]|10)$/.test(w.wave_id);
      if (touches || isContinuationWave) {
        wavesToRun.push(w);
      }
    }
    const w2 = partition.waves.find((w) => w.wave_id === "W-stdd-2");
    if (w2 && !wavesToRun.some((x) => x.wave_id === "W-stdd-2")) {
      const list = await readWaveSidecarList(w2.sidecar_list_path!);
      if (list.sidecars.some((row) => modifiedImplTokens.has(row.impl_token))) {
        wavesToRun.push(w2);
      }
    }
  }
  const seen = new Set<string>();
  let receipt_count = 0;
  const waves_refreshed: string[] = [];
  for (const w of wavesToRun) {
    if (seen.has(w.wave_id)) continue;
    seen.add(w.wave_id);
    const n = await emitG3ReceiptsForWave(w);
    if (n > 0) {
      waves_refreshed.push(w.wave_id);
      receipt_count += n;
    }
  }
  return { waves_refreshed, receipt_count };
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  const allLegacy = hasFlag("--all-legacy");
  const apply = hasFlag("--apply");
  const force = hasFlag("--force");
  const receipts = hasFlag("--receipts");

  if (!waveId && !allLegacy) {
    console.error(
      "Usage: run-fleet-stdd-apply.ts (--wave-id W-stdd-N | --all-legacy) [--apply] [--force] [--receipts]",
    );
    process.exit(1);
  }
  if (waveId && allLegacy) {
    throw new Error("DIAGNOSTIC: use either --wave-id or --all-legacy, not both");
  }

  const loaded = waveId
    ? await loadSidecarsForWave(waveId)
    : await loadAllLegacyFromStddWaves();
  const actions = await planForSidecarRows(loaded.sidecars);
  const dry_run_content_hash = computeDryRunContentHash(actions);
  const outPath = dryRunOutputPath(loaded.wave_scope);

  if (apply) {
    let prior: ApplyDryRunDocument | undefined;
    try {
      prior = JSON.parse(await readFile(outPath, "utf8")) as ApplyDryRunDocument;
    } catch {
      if (!force) {
        throw new Error(
          `DIAGNOSTIC: missing dry-run at ${outPath}; run without --apply first or use --force`,
        );
      }
    }
    if (prior && !force && !hashMatchesDryRunDoc(actions, prior)) {
      throw new Error(
        "DIAGNOSTIC: dry_run_content_hash mismatch — re-run dry-run or pass --force",
      );
    }
    const snapDir = join(DRY_RUN_BASE, SNAPSHOT_SUBDIR, loaded.wave_scope.replace(/\//g, "-"));
    const result = await applyPlannedActions({
      repositoryRoot: REPO_ROOT,
      actions,
      snapshotDir: snapDir,
    });
    const applyDoc: ApplyDryRunDocument = {
      schema_version: "apply-diff.v1",
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
      `TRACE: apply complete modified=${result.modified_paths.length} snapshots=${result.snapshot_paths.length}`,
    );
    if (receipts) {
      const tokens = new Set(
        actions.filter((a) => a.action === "insert_grammar_v2_header").map((a) => a.impl_token),
      );
      const refresh = await refreshReceiptsForScope(loaded.wave_scope, tokens);
      console.log(
        `TRACE: receipts refreshed waves=${refresh.waves_refreshed.join(",")} count=${refresh.receipt_count}`,
      );
    }
  } else {
    const doc: ApplyDryRunDocument = {
      schema_version: "apply-diff.v1",
      generated_at: new Date().toISOString(),
      client_id: loaded.client_id,
      wave_scope: loaded.wave_scope,
      methodology_pin: METHODOLOGY_PIN_LABEL,
      apply_mode: false,
      planned_actions: actions,
      dry_run_content_hash,
    };
    const written = await writeDryRunDoc(doc, loaded.wave_scope);
    const insertCount = actions.filter((a) => a.action === "insert_grammar_v2_header").length;
    console.log(
      `TRACE: dry-run written ${written} hash=${dry_run_content_hash} insert_actions=${insertCount}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
