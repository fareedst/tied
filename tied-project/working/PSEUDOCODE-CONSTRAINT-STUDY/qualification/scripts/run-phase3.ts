#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Phase 3 qualification sweep — typed_gate_errors: true with R1/R2 checks.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { MCP_SERVER_ROOT, PATHS } from "./lib/constants.ts";
import { readManifest, type ManifestEntry } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type Phase3Summary = {
  run_at: string;
  mode: "phase3";
  typed_flow: true;
  typed_gate_errors: true;
  gate_mode: true;
  total: number;
  parse_ok: number;
  gate_pass: number;
  r1_regression_typed_flow_false_unchanged: number;
  r2_prose_only_new_gate_failures: string[];
  new_gate_failures_vs_pilot: string[];
  new_gate_failures_annotated: string[];
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function readBaselineOk(entryId: string): Promise<boolean | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const baselineRaw = await readFile(join(PATHS.baseline, `${entryId}.report.json`), "utf8");
    const baselineReport = JSON.parse(baselineRaw) as { ok?: boolean };
    return baselineReport.ok === true;
  } catch {
    return null;
  }
}

async function sidecarHasAnnotatedProcedure(entry: ManifestEntry): Promise<boolean> {
  const parserPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-parser.js");
  const typedFlowPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-typed-flow.js");
  const [{ parsePseudocodeToIr }, { isAnnotatedProcedure }] = await Promise.all([
    import(parserPath),
    import(typedFlowPath),
  ]);
  const pseudocode = await readFile(entry.sidecar_path, "utf8");
  const parsed = parsePseudocodeToIr(pseudocode);
  if (!parsed.ok) return false;
  return parsed.program.procedures.some((proc: { name: string }) =>
    isAnnotatedProcedure(proc),
  );
}

async function readPilotOk(entryId: string): Promise<boolean | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const pilotRaw = await readFile(
      join(PATHS.pilot, `${entryId}.typed-true.report.json`),
      "utf8",
    );
    const pilotReport = JSON.parse(pilotRaw) as { ok?: boolean };
    return pilotReport.ok === true;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const phase3Dir = join(PATHS.metrics, "..", "phase3");
  await mkdir(phase3Dir, { recursive: true });
  await mkdir(PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(PATHS.manifest);
  const included = manifest.entries.filter((entry) => entry.included);
  console.log(`TRACE: run-phase3 — ${included.length} manifest entries`);

  const summary: Phase3Summary = {
    run_at: new Date().toISOString(),
    mode: "phase3",
    typed_flow: true,
    typed_gate_errors: true,
    gate_mode: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    r1_regression_typed_flow_false_unchanged: 0,
    r2_prose_only_new_gate_failures: [],
    new_gate_failures_vs_pilot: [],
    new_gate_failures_annotated: [],
    failures: [],
  };

  for (const entry of included) {
    try {
      const baselineOk = await readBaselineOk(entry.id);
      const pilotOk = await readPilotOk(entry.id);

      const regression = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: false,
      });
      const phase3 = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
      });

      await writeFile(
        join(phase3Dir, `${entry.id}.regression-false.report.json`),
        `${regression.reportJson}\n`,
        "utf8",
      );
      await writeFile(
        join(phase3Dir, `${entry.id}.typed-gate-errors.report.json`),
        `${phase3.reportJson}\n`,
        "utf8",
      );

      if ("stage" in phase3.report && phase3.report.stage) {
        summary.failures.push({
          entry_id: entry.id,
          stage: String(phase3.report.stage),
          error: String(phase3.report.error ?? "unknown"),
        });
        continue;
      }

      summary.parse_ok += 1;
      if (phase3.report.ok === true) summary.gate_pass += 1;

      const regOk = regression.report.ok === true;
      if (baselineOk !== null && regOk === baselineOk) {
        summary.r1_regression_typed_flow_false_unchanged += 1;
      }

      if (pilotOk === true && phase3.report.ok === false) {
        summary.new_gate_failures_vs_pilot.push(entry.id);
        const hasAnnotated = await sidecarHasAnnotatedProcedure(entry);
        if (!hasAnnotated) {
          summary.r2_prose_only_new_gate_failures.push(entry.id);
        } else {
          summary.new_gate_failures_annotated.push(entry.id);
        }
      }

      const snapshot = extractReportSnapshot(
        phase3.report as Parameters<typeof extractReportSnapshot>[0],
      );
      await writeFile(
        join(PATHS.snapshots, `${entry.id}.phase3.snapshot.json`),
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

  const summaryPath = join(phase3Dir, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.failures.length > 0 ||
    summary.r2_prose_only_new_gate_failures.length > 0
  ) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-phase3 failed", err);
  process.exit(1);
});
