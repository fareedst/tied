#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] P2-G false-positive measurement (OD-P2-4).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  BASELINE_ANCHOR_COMMIT,
  MCP_SERVER_ROOT,
  METHODOLOGY_PIN_LABEL,
  PATHS,
} from "./lib/constants.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import {
  CONSTRAINT_FIXTURE_DIR,
  CONSTRAINT_POSITIVE_CONTROLS,
  GATING_CONSTRAINT_CODES,
} from "./lib/labeled-constraint-fixtures.ts";

const FP_THRESHOLD = 0.05;

type ConstraintSection = {
  diagnostics?: Array<{ code: string }>;
};

type FleetG1Summary = {
  tier_a?: { new_gate_failures_vs_baseline?: string[] };
};

function hasGatingConstraintError(section: ConstraintSection): boolean {
  return (section.diagnostics ?? []).some((d) =>
    (GATING_CONSTRAINT_CODES as readonly string[]).includes(d.code),
  );
}

async function loadAnalyzer() {
  const analyzerPath = join(MCP_SERVER_ROOT, "dist/analysis/pseudocode-analyzer.js");
  const { analyzeEssencePseudocode } = await import(analyzerPath);
  return analyzeEssencePseudocode;
}

async function main(): Promise<void> {
  await mkdir(PATHS.metrics, { recursive: true });
  const analyzeEssencePseudocode = await loadAnalyzer();

  const fixtureResults: Array<{
    id: string;
    file: string;
    false_positive_gating: boolean;
  }> = [];

  for (const entry of CONSTRAINT_POSITIVE_CONTROLS) {
    const source = await readFile(join(CONSTRAINT_FIXTURE_DIR, entry.file), "utf8");
    const report = analyzeEssencePseudocode({
      token: "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
      pseudocode: source,
      gate_mode: true,
      typed_flow: true,
      constraint_flow: true,
      constraint_gate_errors: false,
    }) as { sections?: { constraint_language?: ConstraintSection } };

    const section = report.sections?.constraint_language;
    const fp = section !== undefined && hasGatingConstraintError(section);
    fixtureResults.push({ id: entry.id, file: entry.file, false_positive_gating: fp });
  }

  const falsePositives = fixtureResults.filter((r) => r.false_positive_gating);
  const fpRate = falsePositives.length / CONSTRAINT_POSITIVE_CONTROLS.length;

  let tierANewFailures: string[] = [];
  try {
    const raw = await readFile(join(CONSTRAINT_PATHS.fleetG1, "summary.json"), "utf8");
    const summary = JSON.parse(raw) as FleetG1Summary;
    tierANewFailures = summary.tier_a?.new_gate_failures_vs_baseline ?? [];
  } catch {
    tierANewFailures = [];
  }

  const payload = {
    run_at: new Date().toISOString(),
    mode: "fleet-g1-fp-measurement",
    methodology_pin: METHODOLOGY_PIN_LABEL,
    baseline_anchor_commit: BASELINE_ANCHOR_COMMIT,
    fixture_fp: {
      denominator: CONSTRAINT_POSITIVE_CONTROLS.length,
      false_positives: falsePositives.map((r) => r.id),
      fp_rate: fpRate,
      threshold_max: FP_THRESHOLD,
      pass: fpRate <= FP_THRESHOLD,
      calculation:
        "fp_rate = count(positive_control fixtures with gating constraint diagnostic) / count(positive_control fixtures); per deliverable 04 and pseudocode-constraint-corpus.test.ts FP cap",
      fixture_dir: "mcp-server/src/analysis/fixtures/constraint-language",
      results: fixtureResults,
    },
    tier_a_gate_mode: {
      evidence_path:
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/fleet-g1/summary.json",
      new_gate_failures_vs_baseline: tierANewFailures,
      pass: tierANewFailures.length === 0,
    },
    overall_pass: fpRate <= FP_THRESHOLD && tierANewFailures.length === 0,
  };

  const outPath = join(PATHS.metrics, "fp-fleet-20260912.json");
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(payload, null, 2));

  if (!payload.overall_pass) process.exit(1);
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-fleet-g1-fp-measurement failed", err);
  process.exit(1);
});
