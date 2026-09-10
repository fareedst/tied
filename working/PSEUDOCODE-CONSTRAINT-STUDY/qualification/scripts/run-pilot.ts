#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Step 6 pilot sweep — typed_flow: true + false regression.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { PATHS } from "./lib/constants.ts";
import { readManifest } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type SweepSummary = {
  run_at: string;
  mode: "pilot";
  typed_flow: true;
  gate_mode: true;
  regression_typed_flow_false: boolean;
  total: number;
  parse_ok: number;
  gate_pass: number;
  regression_gate_unchanged: number;
  new_gate_failures: string[];
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function main(): Promise<void> {
  await mkdir(PATHS.pilot, { recursive: true });
  await mkdir(PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(PATHS.manifest);
  const included = manifest.entries.filter((e) => e.included);
  console.log(`TRACE: run-pilot — ${included.length} manifest entries`);

  const summary: SweepSummary = {
    run_at: new Date().toISOString(),
    mode: "pilot",
    typed_flow: true,
    gate_mode: true,
    regression_typed_flow_false: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    regression_gate_unchanged: 0,
    new_gate_failures: [],
    failures: [],
  };

  for (const entry of included) {
    try {
      const baselinePath = join(PATHS.baseline, `${entry.id}.report.json`);
      let baselineOk: boolean | null = null;
      try {
        const { readFile } = await import("node:fs/promises");
        const baselineRaw = await readFile(baselinePath, "utf8");
        const baselineReport = JSON.parse(baselineRaw) as { ok?: boolean };
        baselineOk = baselineReport.ok === true;
      } catch {
        baselineOk = null;
      }

      const regression = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: false,
      });
      const pilot = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
      });

      const regressionPath = join(PATHS.pilot, `${entry.id}.regression-false.report.json`);
      const pilotPath = join(PATHS.pilot, `${entry.id}.typed-true.report.json`);
      await writeFile(regressionPath, `${regression.reportJson}\n`, "utf8");
      await writeFile(pilotPath, `${pilot.reportJson}\n`, "utf8");

      if ("stage" in pilot.report && pilot.report.stage) {
        summary.failures.push({
          entry_id: entry.id,
          stage: String(pilot.report.stage),
          error: String(pilot.report.error ?? "unknown"),
        });
        continue;
      }

      summary.parse_ok += 1;
      if (pilot.report.ok === true) summary.gate_pass += 1;

      const regOk = regression.report.ok === true;
      if (baselineOk !== null && regOk === baselineOk) {
        summary.regression_gate_unchanged += 1;
      }
      if (baselineOk === true && pilot.report.ok === false) {
        summary.new_gate_failures.push(entry.id);
      }

      const snapshot = extractReportSnapshot(
        pilot.report as Parameters<typeof extractReportSnapshot>[0],
      );
      const snapshotPath = join(PATHS.snapshots, `${entry.id}.pilot.snapshot.json`);
      await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    } catch (err) {
      summary.failures.push({
        entry_id: entry.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const summaryPath = join(PATHS.pilot, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failures.length > 0 || summary.new_gate_failures.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-pilot failed", err);
  process.exit(1);
});
