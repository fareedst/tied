#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Aggregate P2-G measurements into f11-fp-thresholds.v1.yaml.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BASELINE_ANCHOR_COMMIT, METHODOLOGY_PIN_LABEL, PATHS, REPO_ROOT } from "./lib/constants.ts";

const OUT_PATH = join(REPO_ROOT, "working/fleet-constraint-v2/f11-fp-thresholds.v1.yaml");

function stripYamlCommentJson(raw: string): string {
  const lines = raw.split("\n");
  const first = lines.findIndex((l) => l.trim().startsWith("{"));
  return first >= 0 ? lines.slice(first).join("\n") : raw;
}

async function main(): Promise<void> {
  const f11Raw = await readFile(join(PATHS.metrics, "f11-fleet-20260912.yaml"), "utf8");
  const f11 = JSON.parse(stripYamlCommentJson(f11Raw)) as {
    run_at: string;
    f11: {
      annotation_lines_median: number;
      authoring_decisions_median: number;
      unknown_delta_median: number;
      gate_pass: boolean;
    };
    procedures: Array<{ preservation_pass: boolean }>;
  };

  const fpRaw = await readFile(join(PATHS.metrics, "fp-fleet-20260912.json"), "utf8");
  const fp = JSON.parse(fpRaw) as {
    run_at: string;
    fixture_fp: { fp_rate: number; pass: boolean; threshold_max: number };
    tier_a_gate_mode: { pass: boolean; new_gate_failures_vs_baseline: string[] };
    overall_pass: boolean;
  };

  const rollbackRaw = await readFile(
    join(REPO_ROOT, "working/fleet-constraint-v2/rollback-exercise-G1.v1.json"),
    "utf8",
  );
  const rollback = JSON.parse(rollbackRaw) as { pass: boolean; run_at: string };

  const preservationAllPass = f11.procedures.every((p) => p.preservation_pass === true);

  const thresholds = {
    schema_version: "f11-fp-thresholds.v1",
    measured_at: new Date().toISOString(),
    methodology_pin: METHODOLOGY_PIN_LABEL,
    baseline_anchor_commit: BASELINE_ANCHOR_COMMIT,
    od_refs: ["OD-P2-3", "OD-P2-4", "OD-P2-6"],
    evidence: {
      f11_metrics:
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/metrics/f11-fleet-20260912.yaml",
      f11_baseline_study:
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/metrics/annotation-overhead.yaml",
      fp_metrics:
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/metrics/fp-fleet-20260912.json",
      fleet_g1_summary:
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/fleet-g1/summary.json",
      rollback_exercise: "working/fleet-constraint-v2/rollback-exercise-G1.v1.json",
    },
    f11_od_p2_3: {
      median_annotation_lines_max: 8,
      median_authoring_decisions_max: 15,
      median_unknown_delta_max: 0,
      all_preservation_reviews_pass: true,
      measured: {
        median_annotation_lines: f11.f11.annotation_lines_median,
        median_authoring_decisions: f11.f11.authoring_decisions_median,
        median_unknown_delta: f11.f11.unknown_delta_median,
        preservation_reviews_pass: preservationAllPass,
        measured_at: f11.run_at,
      },
      pass:
        f11.f11.annotation_lines_median <= 8
        && f11.f11.authoring_decisions_median <= 15
        && f11.f11.unknown_delta_median <= 0
        && preservationAllPass,
    },
    fp_od_p2_4: {
      tier_a_new_gate_mode_failures_max: 0,
      labeled_fixture_fp_rate_max: 0.05,
      measured: {
        tier_a_new_gate_failures: fp.tier_a_gate_mode.new_gate_failures_vs_baseline.length,
        fixture_fp_rate: fp.fixture_fp.fp_rate,
        fixture_fp_pass: fp.fixture_fp.pass,
        measured_at: fp.run_at,
      },
      pass: fp.overall_pass,
    },
    rollback_od_p2_6: {
      exercise_required: true,
      measured_at: rollback.run_at,
      pass: rollback.pass,
    },
    phase_2_exit_thresholds_met:
      f11.f11.gate_pass && fp.overall_pass && rollback.pass,
  };

  const yamlBody = `# [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Phase 2 F11 + FP committed thresholds (P2-G)\n${JSON.stringify(thresholds, null, 2)}\n`;
  await writeFile(OUT_PATH, yamlBody, "utf8");
  console.log(JSON.stringify(thresholds, null, 2));

  if (!thresholds.phase_2_exit_thresholds_met) process.exit(1);
}

main().catch((err) => {
  console.error("DIAGNOSTIC: write-f11-fp-thresholds failed", err);
  process.exit(1);
});
