#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Step 1 baseline sweep — typed_flow: false (current analyzer).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { PATHS } from "./lib/constants.ts";
import { readManifest } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type SweepSummary = {
  run_at: string;
  mode: "baseline";
  typed_flow: false;
  gate_mode: true;
  total: number;
  parse_ok: number;
  gate_pass: number;
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function main(): Promise<void> {
  await mkdir(PATHS.baseline, { recursive: true });
  await mkdir(PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(PATHS.manifest);
  const included = manifest.entries.filter((e) => e.included);
  console.log(`TRACE: run-baseline — ${included.length} manifest entries`);

  const summary: SweepSummary = {
    run_at: new Date().toISOString(),
    mode: "baseline",
    typed_flow: false,
    gate_mode: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    failures: [],
  };

  for (const entry of included) {
    try {
      const { reportJson, report } = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: false,
      });

      const reportPath = join(PATHS.baseline, `${entry.id}.report.json`);
      await writeFile(reportPath, `${reportJson}\n`, "utf8");

      if ("stage" in report && report.stage) {
        summary.failures.push({
          entry_id: entry.id,
          stage: String(report.stage),
          error: String(report.error ?? "unknown"),
        });
        continue;
      }

      summary.parse_ok += 1;
      if (report.ok === true) summary.gate_pass += 1;

      const snapshot = extractReportSnapshot(
        report as Parameters<typeof extractReportSnapshot>[0],
      );
      const snapshotPath = join(PATHS.snapshots, `${entry.id}.baseline.snapshot.json`);
      await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    } catch (err) {
      summary.failures.push({
        entry_id: entry.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const summaryPath = join(PATHS.baseline, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    console.error(
      `DIAGNOSTIC: baseline sweep had ${summary.failures.length} parse failures`,
    );
    process.exit(1);
  }
  console.log(
    `TRACE: run-baseline complete — parse_ok=${summary.parse_ok} gate_pass=${summary.gate_pass}`,
  );
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-baseline failed", err);
  process.exit(1);
});
