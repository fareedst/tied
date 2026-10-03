#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Diff baseline vs pilot snapshots and enforce thresholds.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "./lib/constants.ts";
import { readManifest } from "./lib/manifest.ts";
import type { ReportSnapshot } from "./lib/snapshot.ts";

type CompareResult = {
  entry_id: string;
  tier: string;
  baseline_ok: boolean | null;
  pilot_ok: boolean | null;
  regression_ok: boolean | null;
  snapshot_changed: boolean;
  new_gate_failure: boolean;
  diagnostic_codes_added: string[];
  unknown_causes_added: string[];
};

type CompareSummary = {
  run_at: string;
  compared: number;
  legacy_regression_pass: boolean;
  new_gate_failures: string[];
  snapshot_drift: string[];
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
  await mkdir(PATHS.metrics, { recursive: true });
  const manifest = await readManifest(PATHS.manifest);
  const included = manifest.entries.filter((e) => e.included);

  const summary: CompareSummary = {
    run_at: new Date().toISOString(),
    compared: included.length,
    legacy_regression_pass: true,
    new_gate_failures: [],
    snapshot_drift: [],
    results: [],
  };

  for (const entry of included) {
    const baselineReport = await readJson<{ ok?: boolean }>(
      join(PATHS.baseline, `${entry.id}.report.json`),
    );
    const regressionReport = await readJson<{ ok?: boolean }>(
      join(PATHS.pilot, `${entry.id}.regression-false.report.json`),
    );
    const pilotReport = await readJson<{ ok?: boolean }>(
      join(PATHS.pilot, `${entry.id}.typed-true.report.json`),
    );
    const baselineSnap = await readJson<ReportSnapshot>(
      join(PATHS.snapshots, `${entry.id}.baseline.snapshot.json`),
    );
    const pilotSnap = await readJson<ReportSnapshot>(
      join(PATHS.snapshots, `${entry.id}.pilot.snapshot.json`),
    );

    const baseline_ok = baselineReport?.ok ?? null;
    const regression_ok = regressionReport?.ok ?? null;
    const pilot_ok = pilotReport?.ok ?? null;

    const diagnostic_codes_added =
      pilotSnap && baselineSnap
        ? pilotSnap.diagnostic_codes.filter((c) => !baselineSnap.diagnostic_codes.includes(c))
        : [];
    const unknown_causes_added =
      pilotSnap && baselineSnap
        ? pilotSnap.unknown_causes.filter((c) => !baselineSnap.unknown_causes.includes(c))
        : [];

    const snapshot_changed =
      baselineSnap !== null &&
      pilotSnap !== null &&
      baselineSnap.serialization_hash !== pilotSnap.serialization_hash;

    const new_gate_failure = baseline_ok === true && pilot_ok === false;
    if (new_gate_failure) summary.new_gate_failures.push(entry.id);
    if (entry.tier === "A" || entry.tier === "B") {
      if (baseline_ok !== null && regression_ok !== null && baseline_ok !== regression_ok) {
        summary.legacy_regression_pass = false;
      }
    }
    if (snapshot_changed && entry.tier !== "C") {
      summary.snapshot_drift.push(entry.id);
    }

    summary.results.push({
      entry_id: entry.id,
      tier: entry.tier,
      baseline_ok,
      pilot_ok,
      regression_ok,
      snapshot_changed,
      new_gate_failure,
      diagnostic_codes_added,
      unknown_causes_added,
    });
  }

  const outPath = join(PATHS.metrics, "compare-summary.json");
  await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (!summary.legacy_regression_pass || summary.new_gate_failures.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: compare-reports failed", err);
  process.exit(1);
});
