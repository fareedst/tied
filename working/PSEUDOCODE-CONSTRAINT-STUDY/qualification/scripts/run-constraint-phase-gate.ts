#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Constraint phase-gate sweep — constraint_gate_errors: true (sub-phase 3b).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { MCP_SERVER_ROOT } from "./lib/constants.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import { readManifest, type ManifestEntry } from "./lib/manifest.ts";
import { extractReportSnapshot } from "./lib/snapshot.ts";

type PhaseGateSummary = {
  run_at: string;
  mode: "constraint-phase-gate";
  typed_flow: true;
  constraint_flow: true;
  constraint_gate_errors: true;
  gate_mode: true;
  total: number;
  parse_ok: number;
  gate_pass: number;
  new_gate_failures_vs_pilot: string[];
  new_gate_failures_annotated: string[];
  new_gate_failures_prose_only: string[];
  failures: Array<{ entry_id: string; stage?: string; error?: string }>;
};

async function readPilotOk(entryId: string): Promise<boolean | null> {
  try {
    const raw = await readFile(
      join(CONSTRAINT_PATHS.pilot, `${entryId}.constraint-true.report.json`),
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
  await mkdir(CONSTRAINT_PATHS.phaseGate, { recursive: true });
  await mkdir(CONSTRAINT_PATHS.snapshots, { recursive: true });

  const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
  const included = manifest.entries.filter((entry) => entry.included);
  console.log(`TRACE: run-constraint-phase-gate — ${included.length} manifest entries`);

  const summary: PhaseGateSummary = {
    run_at: new Date().toISOString(),
    mode: "constraint-phase-gate",
    typed_flow: true,
    constraint_flow: true,
    constraint_gate_errors: true,
    gate_mode: true,
    total: included.length,
    parse_ok: 0,
    gate_pass: 0,
    new_gate_failures_vs_pilot: [],
    new_gate_failures_annotated: [],
    new_gate_failures_prose_only: [],
    failures: [],
  };

  for (const entry of included) {
    try {
      const pilotOk = await readPilotOk(entry.id);
      const phaseGate = await analyzeSidecarEntry(entry, {
        gate_mode: true,
        typed_flow: true,
        typed_gate_errors: true,
        constraint_flow: true,
        constraint_gate_errors: true,
      });

      await writeFile(
        join(CONSTRAINT_PATHS.phaseGate, `${entry.id}.constraint-gate-errors.report.json`),
        `${phaseGate.reportJson}\n`,
        "utf8",
      );

      if ("stage" in phaseGate.report && phaseGate.report.stage) {
        summary.failures.push({
          entry_id: entry.id,
          stage: String(phaseGate.report.stage),
          error: String(phaseGate.report.error ?? "unknown"),
        });
        continue;
      }

      summary.parse_ok += 1;
      if (phaseGate.report.ok === true) summary.gate_pass += 1;

      if (pilotOk === true && phaseGate.report.ok === false) {
        summary.new_gate_failures_vs_pilot.push(entry.id);
        const annotated = await sidecarHasConstraintAnnotation(entry);
        if (annotated) {
          summary.new_gate_failures_annotated.push(entry.id);
        } else {
          summary.new_gate_failures_prose_only.push(entry.id);
        }
      }

      const snapshot = extractReportSnapshot(
        phaseGate.report as Parameters<typeof extractReportSnapshot>[0],
      );
      await writeFile(
        join(CONSTRAINT_PATHS.snapshots, `${entry.id}.constraint-phase-gate.snapshot.json`),
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

  const summaryPath = join(CONSTRAINT_PATHS.phaseGate, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failures.length > 0 || summary.new_gate_failures_prose_only.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-constraint-phase-gate failed", err);
  process.exit(1);
});
