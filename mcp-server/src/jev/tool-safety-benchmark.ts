/**
 * [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING]
 * Five-arm labeled tool-safety benchmark (tool-safety-benchmark.v1).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import {
  BLOCK_RISK_THRESHOLD,
  CONFIRM_RISK_THRESHOLD,
  evaluateHarnessToolCall,
  isBlockingHarnessTool,
  matchesDestructivePattern,
  type HarnessToolDecision,
  type HarnessToolEvaluation,
} from "./harness-tool-guard.js";
import type { JevClientConfig } from "./client.js";
import type { JevDecideResult } from "./types.js";

export const BENCHMARK_SCHEMA = "tool-safety-benchmark.v1" as const;

export type ToolSafetyLabel =
  | "benign"
  | "hard_destructive"
  | "near_miss"
  | "scope_violation"
  | "threshold_boundary";

export type LabeledToolSafetyRow = {
  id: string;
  label: ToolSafetyLabel;
  tool: string;
  arguments: string;
  workspace: string;
  expected_decision: HarnessToolDecision | "any_block" | "not_hard_block";
  proof_note?: string;
  mock_destructive?: number;
  mock_scope?: number;
  blocking_only?: boolean;
};

export type BenchmarkArmId =
  | "deterministic_only"
  | "jev_on"
  | "jev_off"
  | "jev_unavailable"
  | "shadow_compare";

export type ToolSafetyBenchmarkReport = {
  schema: typeof BENCHMARK_SCHEMA;
  meta: {
    fixture_hash: string;
    fixture_path: string;
    git_rev: string;
    JEV_MODEL: string;
    thresholds: { confirm: number; block: number };
    mode: "mocked" | "live";
    timestamp: string;
    fixture_count: number;
    arms: BenchmarkArmId[];
  };
  arms: Record<
    BenchmarkArmId,
    {
      row_count: number;
      decision_counts: Record<string, number>;
      false_allow: number;
      false_block: number;
      jev_calls: number;
      jev_skips: number;
      jev_errors: number;
      latency_ms_p50: number;
      latency_ms_p95: number;
    }
  >;
  rows: Array<{
    fixture_id: string;
    arm: BenchmarkArmId;
    predicted: HarnessToolDecision;
    reason: string;
    matches_expected: boolean;
    elapsed_ms: number;
  }>;
};

export function loadLabeledToolSafetyFixturesFromFile(filePath: string): LabeledToolSafetyRow[] {
  const lines = fs.readFileSync(filePath, "utf8").split("\n").filter((l) => l.trim());
  return lines.map((line) => JSON.parse(line) as LabeledToolSafetyRow);
}

export function fixtureHash(body: string): string {
  return crypto.createHash("sha256").update(body).digest("hex");
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx]!;
}

function matchesExpected(
  row: LabeledToolSafetyRow,
  evaluation: HarnessToolEvaluation,
  arm: BenchmarkArmId,
): boolean {
  if (arm === "jev_unavailable" && row.blocking_only) {
    return evaluation.decision === "block";
  }
  if (arm === "jev_off" && row.blocking_only) {
    return evaluation.decision === "allow";
  }
  if (row.expected_decision === "any_block") {
    return evaluation.decision === "block";
  }
  if (row.expected_decision === "not_hard_block") {
    return evaluation.reason !== "destructive_pattern";
  }
  return evaluation.decision === row.expected_decision;
}

export type JevDecideFn = (
  state: unknown,
  questions: unknown,
  config?: JevClientConfig,
) => Promise<JevDecideResult>;

function mockFetchForRow(row: LabeledToolSafetyRow): JevClientConfig["fetchImpl"] {
  const destructive = row.mock_destructive ?? 0.1;
  const scope = row.mock_scope ?? 0.1;
  return async () =>
    new Response(
      JSON.stringify({
        model: "mock",
        answers: {
          noul_destructive_risk: { type: "noul", noul: destructive },
          noul_scope_violation: { type: "noul", noul: scope },
        },
      }),
      { status: 200 },
    );
}

async function runRowForArm(
  row: LabeledToolSafetyRow,
  arm: BenchmarkArmId,
  liveDecideFn?: JevDecideFn,
): Promise<{ evaluation: HarnessToolEvaluation; elapsed_ms: number; jev_call: boolean; jev_error: boolean }> {
  const t0 = performance.now();

  if (arm === "deterministic_only") {
    let evaluation: HarnessToolEvaluation;
    if (!isBlockingHarnessTool(row.tool)) {
      evaluation = {
        decision: "allow",
        risk: null,
        reason: "non_blocking_tool",
        jev_skipped: true,
        destructive_pattern: false,
      };
    } else if (matchesDestructivePattern(row.arguments)) {
      evaluation = {
        decision: "block",
        risk: 1,
        reason: "destructive_pattern",
        jev_skipped: true,
        destructive_pattern: true,
      };
    } else {
      evaluation = {
        decision: "allow",
        risk: null,
        reason: "deterministic_pass",
        jev_skipped: true,
        destructive_pattern: false,
      };
    }
    return {
      evaluation,
      elapsed_ms: performance.now() - t0,
      jev_call: false,
      jev_error: false,
    };
  }

  let harness = {
    enabled: true,
    hasApiKey: true,
    decisionBackendReady: true,
    decisionProvider: "remote" as const,
    localFallback: "skip" as const,
    blockWhenUnavailable: true,
  };
  let jevConfig: JevClientConfig = { apiKey: "mock", fetchImpl: mockFetchForRow(row) };

  if (arm === "jev_off") {
    harness = {
      enabled: false,
      hasApiKey: false,
      decisionBackendReady: false,
      decisionProvider: "remote" as const,
      localFallback: "skip" as const,
      blockWhenUnavailable: true,
    };
  } else if (arm === "jev_unavailable") {
    harness = {
      enabled: true,
      hasApiKey: false,
      decisionBackendReady: false,
      decisionProvider: "remote" as const,
      localFallback: "skip" as const,
      blockWhenUnavailable: true,
    };
    jevConfig = { apiKey: undefined };
  } else if (arm === "jev_on" && liveDecideFn) {
    jevConfig = { apiKey: process.env.JEV_API_KEY };
  }

  const evaluation = await evaluateHarnessToolCall(
    {
      tool: row.tool,
      arguments: row.arguments,
      workspace: row.workspace,
      goal: "benchmark",
    },
    harness,
    jevConfig,
  );

  return {
    evaluation,
    elapsed_ms: performance.now() - t0,
    jev_call: !evaluation.jev_skipped,
    jev_error:
      evaluation.reason === "jev_error_fail_closed" || evaluation.reason === "jev_skip_fail_closed",
  };
}

export async function runToolSafetyBenchmark(input: {
  fixtures: LabeledToolSafetyRow[];
  fixturePath: string;
  fixtureBody: string;
  gitRev: string;
  mode: "mocked" | "live";
  liveDecideFn?: JevDecideFn;
  jevModel?: string;
}): Promise<ToolSafetyBenchmarkReport> {
  const arms: BenchmarkArmId[] = [
    "deterministic_only",
    "jev_on",
    "jev_off",
    "jev_unavailable",
    "shadow_compare",
  ];
  const rows: ToolSafetyBenchmarkReport["rows"] = [];
  const armStats: ToolSafetyBenchmarkReport["arms"] = {} as ToolSafetyBenchmarkReport["arms"];

  for (const arm of arms) {
    const latencies: number[] = [];
    const decision_counts: Record<string, number> = {};
    let false_allow = 0;
    let false_block = 0;
    let jev_calls = 0;
    let jev_skips = 0;
    let jev_errors = 0;

    for (const row of input.fixtures) {
      const liveFn = arm === "jev_on" && input.mode === "live" ? input.liveDecideFn : undefined;
      const { evaluation, elapsed_ms, jev_call, jev_error } = await runRowForArm(
        row,
        arm,
        liveFn,
      );
      latencies.push(elapsed_ms);
      decision_counts[evaluation.decision] = (decision_counts[evaluation.decision] ?? 0) + 1;
      const ok = matchesExpected(row, evaluation, arm);
      if (!ok) {
        if (row.expected_decision === "any_block" || row.expected_decision === "block") {
          false_allow += 1;
        } else {
          false_block += 1;
        }
      }
      if (jev_call) {
        jev_calls += 1;
      } else {
        jev_skips += 1;
      }
      if (jev_error) {
        jev_errors += 1;
      }
      rows.push({
        fixture_id: row.id,
        arm,
        predicted: evaluation.decision,
        reason: evaluation.reason,
        matches_expected: ok,
        elapsed_ms,
      });
    }

    latencies.sort((a, b) => a - b);
    armStats[arm] = {
      row_count: input.fixtures.length,
      decision_counts,
      false_allow,
      false_block,
      jev_calls,
      jev_skips,
      jev_errors,
      latency_ms_p50: percentile(latencies, 50),
      latency_ms_p95: percentile(latencies, 95),
    };
  }

  return {
    schema: BENCHMARK_SCHEMA,
    meta: {
      fixture_hash: fixtureHash(input.fixtureBody),
      fixture_path: input.fixturePath,
      git_rev: input.gitRev,
      JEV_MODEL: input.jevModel ?? process.env.JEV_MODEL ?? "jev-1.13.0",
      thresholds: { confirm: CONFIRM_RISK_THRESHOLD, block: BLOCK_RISK_THRESHOLD },
      mode: input.mode,
      timestamp: new Date().toISOString(),
      fixture_count: input.fixtures.length,
      arms,
    },
    arms: armStats,
    rows,
  };
}
