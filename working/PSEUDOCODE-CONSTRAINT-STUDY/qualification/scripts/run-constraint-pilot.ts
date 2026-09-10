#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Constraint pilot sweep — constraint_flow: true, warnings only (R2).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { MCP_SERVER_ROOT } from "./lib/constants.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import { readManifest, type ManifestEntry } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type SweepSummary = {
  run_at: string;
  mode: "constraint-pilot";
  typed_flow: true;
  constraint_flow: true;
  constraint_gate_errors: false;
  gate_mode: true;
  total: number;
  parse_ok: number;
  gate_pass: number;
  r1_regression_constraint_off_unchanged: number;
  r2_prose_only_new_gate_failures: string[];
  new_gate_failures_vs_phase3: string[];
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function readPhase3Ok(entryId: string): Promise<boolean | null> {
  try {
    const raw = await readFile(
      join(CONSTRAINT_PATHS.phase3, `${entryId}.typed-gate-errors.report.json`),
      "utf8",
    );
    return (JSON.parse(raw) as { ok?: boolean }).ok === true;
  } catch {
    return null;
  }
}

async function sidecarHasConstraintAnnotation(entry: ManifestEntry): Promise<boolean> {
  const parserPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-parser.js");
  const constraintPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-constraint-language.js");
  const [{ parsePseudocodeToIr }, { isConstraintAnnotatedProcedure }] = await Promise.all([
    import(parserPath),
    import(constraintPath),
  ]);
  const pseudocode = await readFile(entry.sidecar_path, "utf8");
  const parsed = parsePseudocodeToIr(pseudocode);
  if (!parsed.ok) return false;
  const grammarVersion = parsed.program.grammar_version ?? "pseudocode-grammar.v1";
  return parsed.program.procedures.some((proc: { name: string }) =>
    isConstraintAnnotatedProcedure(proc, grammarVersion),
  );
}

async function main(): Promise<void> {
  await mkdir(CONSTRAINT_PATHS.pilot, { recursive: true });
  await mkdir(CONSTRAINT_PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
  const included = manifest.entries.filter((entry) => entry.included);
  console.log(`TRACE: run-constraint-pilot — ${included.length} manifest entries`);

  const summary: SweepSummary = {
    run_at: new Date().toISOString(),
    mode: "constraint-pilot",
    typed_flow: true,
    constraint_flow: true,
    constraint_gate_errors: false,
    gate_mode: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    r1_regression_constraint_off_unchanged: 0,
    r2_prose_only_new_gate_failures: [],
    new_gate_failures_vs_phase3: [],
    failures: [],
  };

  for (const entry of included) {
    try {
      const phase3Ok = await readPhase3Ok(entry.id);

      const regression = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
        constraint_flow: false,
      });
      const pilot = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
        constraint_flow: true,
        constraint_gate_errors: false,
      });

      await writeFile(
        join(CONSTRAINT_PATHS.pilot, `${entry.id}.regression-off.report.json`),
        `${regression.reportJson}\n`,
        "utf8",
      );
      await writeFile(
        join(CONSTRAINT_PATHS.pilot, `${entry.id}.constraint-true.report.json`),
        `${pilot.reportJson}\n`,
        "utf8",
      );

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
      if (phase3Ok !== null && regOk === phase3Ok) {
        summary.r1_regression_constraint_off_unchanged += 1;
      }

      if (phase3Ok === true && pilot.report.ok === false) {
        summary.new_gate_failures_vs_phase3.push(entry.id);
        const hasConstraintAnnotation = await sidecarHasConstraintAnnotation(entry);
        if (!hasConstraintAnnotation) {
          summary.r2_prose_only_new_gate_failures.push(entry.id);
        }
      }

      const snapshot = extractReportSnapshot(
        pilot.report as Parameters<typeof extractReportSnapshot>[0],
      );
      await writeFile(
        join(CONSTRAINT_PATHS.snapshots, `${entry.id}.constraint-pilot.snapshot.json`),
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

  const summaryPath = join(CONSTRAINT_PATHS.pilot, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.failures.length > 0 ||
    summary.r2_prose_only_new_gate_failures.length > 0
  ) {
    console.error("DIAGNOSTIC: R2 hard stop — prose-only new gate failures");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-constraint-pilot failed", err);
  process.exit(1);
});
