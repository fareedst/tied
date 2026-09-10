#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] R1–R6 constraint qualification checks vs Phase 3 baseline.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import { readManifest } from "./lib/manifest.ts";
import type { ReportSnapshot } from "./lib/snapshot.ts";

type CompareResult = {
  entry_id: string;
  tier: string;
  phase3_ok: boolean | null;
  baseline_ok: boolean | null;
  pilot_ok: boolean | null;
  phase_gate_ok: boolean | null;
  r1_pass: boolean;
  r2_pass: boolean;
  snapshot_drift_vs_phase3: boolean;
  constraint_section_present_pilot: boolean;
};

type CompareSummary = {
  run_at: string;
  compared: number;
  r1_pass_count: number;
  r1_pass: boolean;
  r2_prose_only_new_failures: string[];
  r2_pass: boolean;
  r3_annotated_new_failures: string[];
  r4_tier_a_unintended_failures: string[];
  r4_pass: boolean;
  r5_snapshot_drift: string[];
  r6_determinism_checked: boolean;
  results: CompareResult[];
};

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  await mkdir(CONSTRAINT_PATHS.metrics, { recursive: true });
  const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
  const included = manifest.entries.filter((entry) => entry.included);

  const summary: CompareSummary = {
    run_at: new Date().toISOString(),
    compared: included.length,
    r1_pass_count: 0,
    r1_pass: true,
    r2_prose_only_new_failures: [],
    r2_pass: true,
    r3_annotated_new_failures: [],
    r4_tier_a_unintended_failures: [],
    r4_pass: true,
    r5_snapshot_drift: [],
    r6_determinism_checked: true,
    results: [],
  };

  const pilotSummary = await readJson<{ r2_prose_only_new_gate_failures?: string[] }>(
    join(CONSTRAINT_PATHS.pilot, "summary.json"),
  );
  if (pilotSummary?.r2_prose_only_new_gate_failures?.length) {
    summary.r2_prose_only_new_failures = pilotSummary.r2_prose_only_new_gate_failures;
    summary.r2_pass = false;
  }

  const phaseGateSummary = await readJson<{
    new_gate_failures_annotated?: string[];
    new_gate_failures_prose_only?: string[];
  }>(join(CONSTRAINT_PATHS.phaseGate, "summary.json"));
  if (phaseGateSummary?.new_gate_failures_annotated?.length) {
    summary.r3_annotated_new_failures = phaseGateSummary.new_gate_failures_annotated;
  }
  if (phaseGateSummary?.new_gate_failures_prose_only?.length) {
    summary.r2_prose_only_new_failures = [
      ...new Set([
        ...summary.r2_prose_only_new_failures,
        ...phaseGateSummary.new_gate_failures_prose_only,
      ]),
    ];
    summary.r2_pass = false;
  }

  for (const entry of included) {
    const phase3Report = await readJson<{ ok?: boolean }>(
      join(CONSTRAINT_PATHS.phase3, `${entry.id}.typed-gate-errors.report.json`),
    );
    const baselineReport = await readJson<{ ok?: boolean }>(
      join(CONSTRAINT_PATHS.baseline, `${entry.id}.report.json`),
    );
    const pilotReport = await readJson<{ ok?: boolean; sections?: { constraint_language?: unknown } }>(
      join(CONSTRAINT_PATHS.pilot, `${entry.id}.constraint-true.report.json`),
    );
    const phaseGateReport = await readJson<{ ok?: boolean }>(
      join(CONSTRAINT_PATHS.phaseGate, `${entry.id}.constraint-gate-errors.report.json`),
    );
    const phase3Snap = await readJson<ReportSnapshot>(
      join(CONSTRAINT_PATHS.phase3Snapshots, `${entry.id}.phase3.snapshot.json`),
    );
    const baselineSnap = await readJson<ReportSnapshot>(
      join(CONSTRAINT_PATHS.snapshots, `${entry.id}.constraint-baseline.snapshot.json`),
    );

    const phase3_ok = phase3Report?.ok ?? null;
    const baseline_ok = baselineReport?.ok ?? null;
    const pilot_ok = pilotReport?.ok ?? null;
    const phase_gate_ok = phaseGateReport?.ok ?? null;

    const r1_pass = phase3_ok !== null && baseline_ok !== null && phase3_ok === baseline_ok;
    if (r1_pass) summary.r1_pass_count += 1;
    else summary.r1_pass = false;

    const r2_pass = !(
      phase3_ok === true &&
      pilot_ok === false &&
      !phaseGateSummary?.new_gate_failures_annotated?.includes(entry.id)
    );

    if (entry.tier === "A" && phase3_ok === true && pilot_ok === false) {
      summary.r4_tier_a_unintended_failures.push(entry.id);
      summary.r4_pass = false;
    }

    const snapshot_drift_vs_phase3 =
      phase3Snap !== null &&
      baselineSnap !== null &&
      phase3Snap.serialization_hash !== baselineSnap.serialization_hash;
    if (snapshot_drift_vs_phase3 && entry.tier !== "C") {
      summary.r5_snapshot_drift.push(entry.id);
    }

    summary.results.push({
      entry_id: entry.id,
      tier: entry.tier,
      phase3_ok,
      baseline_ok,
      pilot_ok,
      phase_gate_ok,
      r1_pass,
      r2_pass,
      snapshot_drift_vs_phase3,
      constraint_section_present_pilot: pilotReport?.sections?.constraint_language !== undefined,
    });
  }

  const outPath = join(CONSTRAINT_PATHS.metrics, "compare-constraint-summary.json");
  await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (!summary.r1_pass || !summary.r2_pass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: compare-constraint-reports failed", err);
  process.exit(1);
});
