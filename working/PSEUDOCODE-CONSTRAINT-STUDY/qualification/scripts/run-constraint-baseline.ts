#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Constraint baseline sweep — constraint_flow: false vs Phase 3 (R1).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import { readManifest } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type SweepSummary = {
  run_at: string;
  mode: "constraint-baseline";
  typed_flow: true;
  typed_gate_errors: true;
  constraint_flow: false;
  constraint_gate_errors: false;
  gate_mode: true;
  total: number;
  parse_ok: number;
  gate_pass: number;
  r1_unchanged_vs_phase3: number;
  r1_failures: string[];
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function readPhase3Ok(entryId: string): Promise<boolean | null> {
  try {
    const raw = await readFile(
      join(CONSTRAINT_PATHS.phase3, `${entryId}.typed-gate-errors.report.json`),
      "utf8",
    );
    const report = JSON.parse(raw) as { ok?: boolean };
    return report.ok === true;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  await mkdir(CONSTRAINT_PATHS.baseline, { recursive: true });
  await mkdir(CONSTRAINT_PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
  const included = manifest.entries.filter((entry) => entry.included);
  console.log(`TRACE: run-constraint-baseline — ${included.length} manifest entries`);

  const summary: SweepSummary = {
    run_at: new Date().toISOString(),
    mode: "constraint-baseline",
    typed_flow: true,
    typed_gate_errors: true,
    constraint_flow: false,
    constraint_gate_errors: false,
    gate_mode: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    r1_unchanged_vs_phase3: 0,
    r1_failures: [],
    failures: [],
  };

  for (const entry of included) {
    try {
      const phase3Ok = await readPhase3Ok(entry.id);
      const { reportJson, report } = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
        constraint_flow: false,
        constraint_gate_errors: false,
      });

      await writeFile(join(CONSTRAINT_PATHS.baseline, `${entry.id}.report.json`), `${reportJson}\n`, "utf8");

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

      const currentOk = report.ok === true;
      if (phase3Ok !== null && currentOk === phase3Ok) {
        summary.r1_unchanged_vs_phase3 += 1;
      } else if (phase3Ok !== null && currentOk !== phase3Ok) {
        summary.r1_failures.push(entry.id);
      }

      const snapshot = extractReportSnapshot(
        report as Parameters<typeof extractReportSnapshot>[0],
      );
      await writeFile(
        join(CONSTRAINT_PATHS.snapshots, `${entry.id}.constraint-baseline.snapshot.json`),
        `${JSON.stringify(snapshot, null, 2)}\n`,
        "utf8",
      );
    } catch (err) {
      summary.failures.push({
        entry_id: entry.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const summaryPath = join(CONSTRAINT_PATHS.baseline, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.failures.length > 0 ||
    summary.r1_unchanged_vs_phase3 !== summary.total ||
    summary.r1_failures.length > 0
  ) {
    console.error("DIAGNOSTIC: R1 hard stop — constraint baseline drift vs Phase 3");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-constraint-baseline failed", err);
  process.exit(1);
});
