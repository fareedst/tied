#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 4 — enrolled external client header + constraint-ready assist.
 * Mutates sidecars under client repository_root (absolute paths in wave lists); evidence under stdd working/.
 */
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT } from "./lib/constants.ts";
import {
  applyConstraintReadyPlannedActions,
  computeConstraintReadyDryRunHash,
  hashMatchesConstraintReadyDoc,
  planConstraintReadyActionForSidecar,
  type ConstraintReadyDryRunDocument,
  type PlannedConstraintReadyAction,
} from "./lib/fleet-constraint-ready-assist.ts";
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
} from "./lib/fleet-wave-partition.ts";
import {
  readWaveSidecarList,
  resolveSidecarAbsPath,
  type WaveSidecar,
} from "./lib/pilot-wave.ts";

const STDD_CLIENT_ID = "stdd";
const EXTERNAL_WAVE_PREFIX = "W-ext-";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function dryRunBase(clientId: string): string {
  return join(REPO_ROOT, "working/fleet-constraint-v2/waves", clientId, "dry-run");
}

function headerDryRunPath(clientId: string, waveScope: string): string {
  const safe = waveScope.replace(/[^a-zA-Z0-9.-]+/g, "-");
  return join(dryRunBase(clientId), `apply-${safe}.v1.json`);
}

function constraintDryRunPath(clientId: string, waveScope: string): string {
  const safe = waveScope.replace(/[^a-zA-Z0-9.-]+/g, "-");
  return join(dryRunBase(clientId), `constraint-ready-${safe}.v1.json`);
}

async function loadExternalWave(waveId: string): Promise<{
  wave_scope: string;
  sidecars: WaveSidecar[];
  client_id: string;
}> {
  if (!waveId.startsWith(EXTERNAL_WAVE_PREFIX)) {
    throw new Error(`DIAGNOSTIC: expected ${EXTERNAL_WAVE_PREFIX}* wave id, got ${waveId}`);
  }
  const partitionPath =
    argValue("--partition") ??
    join(REPO_ROOT, "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml");
  const partition = await loadFleetWavePartition(partitionPath);
  const waveEntry = getWaveById(partition, waveId);
  if (!waveEntry.sidecar_list_path) {
    throw new Error(`DIAGNOSTIC: wave ${waveId} missing sidecar_list_path`);
  }
  const wave = await readWaveSidecarList(waveEntry.sidecar_list_path);
  if (wave.client_id === STDD_CLIENT_ID) {
    throw new Error("DIAGNOSTIC: use run-fleet-stdd-apply for stdd waves");
  }
  return { wave_scope: waveId, sidecars: wave.sidecars, client_id: wave.client_id };
}

async function planHeaderRows(rows: WaveSidecar[]): Promise<PlannedSidecarAction[]> {
  const actions: PlannedSidecarAction[] = [];
  for (const row of rows) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    actions.push(planActionForSidecar(row.sidecar_path, row.impl_token, text));
  }
  return actions;
}

async function planConstraintRows(rows: WaveSidecar[]): Promise<PlannedConstraintReadyAction[]> {
  const actions: PlannedConstraintReadyAction[] = [];
  for (const row of rows) {
    const abs = resolveSidecarAbsPath(row.sidecar_path);
    const text = await readFile(abs, "utf8");
    actions.push(planConstraintReadyActionForSidecar(row.sidecar_path, row.impl_token, text));
  }
  return actions;
}

async function runHeaderPhase(
  loaded: { wave_scope: string; sidecars: WaveSidecar[]; client_id: string },
  apply: boolean,
  force: boolean,
): Promise<{ modified_tokens: Set<string> }> {
  const actions = await planHeaderRows(loaded.sidecars);
  const dry_run_content_hash = computeDryRunContentHash(actions);
  const outPath = headerDryRunPath(loaded.client_id, loaded.wave_scope);
  await mkdir(dryRunBase(loaded.client_id), { recursive: true });

  if (!apply) {
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
    await writeFile(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    const insertCount = actions.filter((a) => a.action === "insert_grammar_v2_header").length;
    console.log(
      `TRACE: external header dry-run ${outPath} hash=${dry_run_content_hash} insert=${insertCount}`,
    );
    return { modified_tokens: new Set() };
  }

  let prior: ApplyDryRunDocument | undefined;
  try {
    prior = JSON.parse(await readFile(outPath, "utf8")) as ApplyDryRunDocument;
  } catch {
    if (!force) {
      throw new Error(
        `DIAGNOSTIC: missing header dry-run at ${outPath}; run without --apply first or use --force`,
      );
    }
  }
  if (prior && !force && !hashMatchesDryRunDoc(actions, prior)) {
    throw new Error(
      "DIAGNOSTIC: header dry_run_content_hash mismatch — re-run dry-run or pass --force",
    );
  }
  const snapDir = join(
    dryRunBase(loaded.client_id),
    "snapshots",
    loaded.wave_scope.replace(/\//g, "-"),
  );
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
  await writeFile(outPath, `${JSON.stringify(applyDoc, null, 2)}\n`, "utf8");
  console.log(
    `TRACE: external header apply modified=${result.modified_paths.length} snapshots=${result.snapshot_paths.length}`,
  );
  const modified_tokens = new Set(
    actions.filter((a) => a.action === "insert_grammar_v2_header").map((a) => a.impl_token),
  );
  return { modified_tokens };
}

async function runConstraintPhase(
  loaded: { wave_scope: string; sidecars: WaveSidecar[]; client_id: string },
  apply: boolean,
  force: boolean,
): Promise<void> {
  const actions = await planConstraintRows(loaded.sidecars);
  const dry_run_content_hash = computeConstraintReadyDryRunHash(actions);
  const outPath = constraintDryRunPath(loaded.client_id, loaded.wave_scope);
  await mkdir(dryRunBase(loaded.client_id), { recursive: true });

  if (!apply) {
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
    await writeFile(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    const insertCount = actions.filter(
      (a) => a.action === "insert_minimal_procedure_contract",
    ).length;
    const manualCount = actions.filter(
      (a) => a.action === "flag_manual_contract_migration",
    ).length;
    console.log(
      `TRACE: external constraint-ready dry-run ${outPath} hash=${dry_run_content_hash} insert=${insertCount} manual=${manualCount}`,
    );
    return;
  }

  let prior: ConstraintReadyDryRunDocument | undefined;
  try {
    prior = JSON.parse(await readFile(outPath, "utf8")) as ConstraintReadyDryRunDocument;
  } catch {
    if (!force) {
      throw new Error(
        `DIAGNOSTIC: missing constraint dry-run at ${outPath}; run without --apply first or use --force`,
      );
    }
  }
  if (prior && !force && !hashMatchesConstraintReadyDoc(actions, prior)) {
    throw new Error(
      "DIAGNOSTIC: constraint dry_run_content_hash mismatch — re-run dry-run or pass --force",
    );
  }
  const snapDir = join(
    dryRunBase(loaded.client_id),
    "snapshots-constraint-ready",
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
  await writeFile(outPath, `${JSON.stringify(applyDoc, null, 2)}\n`, "utf8");
  console.log(
    `TRACE: external constraint-ready apply modified=${result.modified_paths.length} manual_flags=${actions.filter((a) => a.action === "flag_manual_contract_migration").length}`,
  );
}

function refreshG3Receipts(waveId: string): void {
  const script = join(
    REPO_ROOT,
    "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-g3-wave.ts",
  );
  execSync(
    `node --experimental-strip-types "${script}" --wave-id ${waveId}`,
    { cwd: REPO_ROOT, stdio: "inherit" },
  );
}

async function main(): Promise<void> {
  const waveId = argValue("--wave-id");
  const apply = hasFlag("--apply");
  const force = hasFlag("--force");
  const skipReceipts = hasFlag("--skip-receipts");
  const headerOnly = hasFlag("--header-only");
  const constraintOnly = hasFlag("--constraint-only");

  if (!waveId) {
    console.error(
      "Usage: run-fleet-external-client-apply.ts --wave-id W-ext-{client}-1 [--apply] [--force] [--header-only|--constraint-only] [--skip-receipts]",
    );
    process.exit(1);
  }

  const loaded = await loadExternalWave(waveId);

  if (!constraintOnly) {
    await runHeaderPhase(loaded, apply, force);
  }
  if (!headerOnly) {
    if (apply && !constraintOnly) {
      // Header mutations change constraint-ready classification; refresh dry-run before apply.
      await runConstraintPhase(loaded, false, force);
    }
    await runConstraintPhase(loaded, apply, force);
  }
  if (apply && !skipReceipts) {
    refreshG3Receipts(waveId);
  }

  console.log(
    JSON.stringify({
      ok: true,
      client_id: loaded.client_id,
      wave_id: waveId,
      apply_mode: apply,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
