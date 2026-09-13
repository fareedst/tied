/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] stdd W-stdd-3..10 dependency-first wave planning.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT, STDD_PROJECT_SIDECARS_ROOT } from "./constants.ts";
import {
  classifySidecarText,
  type SidecarMigrationState,
} from "./fleet-inventory-merge.ts";
import {
  implTokenFromSidecarFilename,
  renderWaveSidecarListYaml,
  splitSidecarBatches,
} from "./external-client-scan.ts";
import { readWaveSidecarList } from "./pilot-wave.ts";

export type StddSidecarCandidate = {
  impl_token: string;
  sidecar_path: string;
  classification: SidecarMigrationState;
  dependency_tier: number;
};

export type StddWavePlanEntry = {
  wave_id: string;
  wave_number: number;
  sidecars: StddSidecarCandidate[];
  notes: string;
};

export const DEFAULT_WAVE1_LIST =
  "working/fleet-constraint-v2/pilots/stdd/wave-1-sidecars.yaml";
export const DEFAULT_WAVE2_LIST =
  "working/fleet-constraint-v2/waves/stdd/wave-2-sidecars.yaml";

/** Lower tier migrates earlier (platform stack before leaf features). */
export function dependencyTierForImplToken(implToken: string): number {
  const body = implToken.replace(/^IMPL-/, "");
  if (/^(PSEUDOCODE|MCP|MODULE_VALIDATION)/.test(body)) return 10;
  if (/^(QUALITY|TIED)/.test(body)) return 20;
  if (/^(ASYNC|EVIDENCE|REQUEST|VOCABULARY|PROMPT)/.test(body)) return 30;
  if (/^GOAGENT/.test(body)) return 40;
  if (/^FEAT/.test(body)) return 50;
  if (/^ATDD/.test(body)) return 60;
  return 45;
}

export function compareStddSidecarsDependencyFirst(
  a: StddSidecarCandidate,
  b: StddSidecarCandidate,
): number {
  if (a.dependency_tier !== b.dependency_tier) {
    return a.dependency_tier - b.dependency_tier;
  }
  return a.impl_token.localeCompare(b.impl_token);
}

export async function loadExcludedImplTokens(
  waveListPaths: string[],
): Promise<Set<string>> {
  const excluded = new Set<string>();
  for (const rel of waveListPaths) {
    const wave = await readWaveSidecarList(rel);
    for (const row of wave.sidecars) {
      excluded.add(row.impl_token);
    }
  }
  return excluded;
}

export async function scanStddProjectSidecars(): Promise<StddSidecarCandidate[]> {
  const files = (await readdir(STDD_PROJECT_SIDECARS_ROOT))
    .filter((f) => f.endsWith("-pseudocode.md"))
    .sort();
  const rows: StddSidecarCandidate[] = [];
  for (const file of files) {
    const impl_token = implTokenFromSidecarFilename(file);
    const relPath = join("tied/implementation-decisions", file).replace(/\\/g, "/");
    const text = await readFile(join(STDD_PROJECT_SIDECARS_ROOT, file), "utf8");
    rows.push({
      impl_token,
      sidecar_path: relPath,
      classification: classifySidecarText(text),
      dependency_tier: dependencyTierForImplToken(impl_token),
    });
  }
  return rows;
}

export function filterAndOrderStddSidecars(
  all: StddSidecarCandidate[],
  excluded: Set<string>,
): StddSidecarCandidate[] {
  return all
    .filter((row) => !excluded.has(row.impl_token))
    .sort(compareStddSidecarsDependencyFirst);
}

export function assignStddWaveNumbers(
  ordered: StddSidecarCandidate[],
  options: {
    firstWaveNumber: number;
    lastWaveNumber: number;
    maxSidecarsPerWave: number;
  },
): StddWavePlanEntry[] {
  const batches = splitSidecarBatches(ordered, options.maxSidecarsPerWave);
  const slots = options.lastWaveNumber - options.firstWaveNumber + 1;
  const plan: StddWavePlanEntry[] = [];
  for (let i = 0; i < slots; i += 1) {
    const waveNumber = options.firstWaveNumber + i;
    const batch = batches[i] ?? [];
    const tierSet = [...new Set(batch.map((r) => r.dependency_tier))].sort((a, b) => a - b);
    const notes =
      batch.length === 0
        ? `P4-E continuation — no remaining sidecars for W-stdd-${waveNumber} (partition slot reserved).`
        : [
            `P4-E continuation — dependency-first batch (${batch.length} sidecars, tiers ${tierSet.join(",")}).`,
            "Excludes W-stdd-1 (stdd-wave-1) and W-stdd-2 tokens; platform/quality/TIED/async before GOAGENT/FEAT/ATDD.",
            `Classifications: ${summarizeClassifications(batch)}.`,
          ].join("\n");
    plan.push({
      wave_id: `W-stdd-${waveNumber}`,
      wave_number: waveNumber,
      sidecars: batch,
      notes,
    });
  }
  if (batches.length > slots) {
    throw new Error(
      `DIAGNOSTIC: ${batches.length} batches exceed partition slots ${slots} (need W-stdd-${options.lastWaveNumber + 1}+)`,
    );
  }
  return plan;
}

function summarizeClassifications(batch: StddSidecarCandidate[]): string {
  const counts = new Map<string, number>();
  for (const row of batch) {
    counts.set(row.classification, (counts.get(row.classification) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join(", ");
}

export async function buildStddWavePlan(options?: {
  wave1ListPath?: string;
  wave2ListPath?: string;
  firstWaveNumber?: number;
  lastWaveNumber?: number;
  maxSidecarsPerWave?: number;
}): Promise<{
  excluded_count: number;
  remaining_count: number;
  waves: StddWavePlanEntry[];
}> {
  const wave1 = options?.wave1ListPath ?? DEFAULT_WAVE1_LIST;
  const wave2 = options?.wave2ListPath ?? DEFAULT_WAVE2_LIST;
  const excluded = await loadExcludedImplTokens([wave1, wave2]);
  const all = await scanStddProjectSidecars();
  const ordered = filterAndOrderStddSidecars(all, excluded);
  const waves = assignStddWaveNumbers(ordered, {
    firstWaveNumber: options?.firstWaveNumber ?? 3,
    lastWaveNumber: options?.lastWaveNumber ?? 10,
    maxSidecarsPerWave: options?.maxSidecarsPerWave ?? 10,
  });
  return {
    excluded_count: excluded.size,
    remaining_count: ordered.length,
    waves,
  };
}

export function renderStddWaveSidecarYaml(
  entry: StddWavePlanEntry,
  methodologyPin = "48d1fbb+",
): string {
  return renderWaveSidecarListYaml({
    client_id: "stdd",
    methodology_pin: methodologyPin,
    wave_id: entry.wave_id,
    notes: entry.notes,
    sidecars: entry.sidecars.map((r) => ({
      impl_token: r.impl_token,
      sidecar_path: r.sidecar_path,
    })),
  });
}

export function stddWaveSidecarListRelPath(waveNumber: number): string {
  return `working/fleet-constraint-v2/waves/stdd/wave-${waveNumber}-sidecars.yaml`;
}

export function stddWaveSidecarListAbsPath(waveNumber: number): string {
  return join(REPO_ROOT, stddWaveSidecarListRelPath(waveNumber));
}
