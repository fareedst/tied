#!/usr/bin/env bun
/**
 * [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING]
 * Replay context pruning benchmark — all five arms on the same fixture corpus.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  type BenchmarkArm,
  type ContextLogPruneMetrics,
  pruneContextLog,
} from "../src/jev/context-log-pruner.js";
import { resolveJevApiKey } from "../src/jev/resolve-jev-api-key.js";

const ARMS: BenchmarkArm[] = [
  "raw_before",
  "deterministic_only",
  "pruner_jev_off",
  "pruner_jev_on",
  "pruner_jev_unavailable",
];

const repoRoot = path.resolve(import.meta.dir, "../..");
const defaultFixtures = path.join(
  repoRoot,
  "mcp-server/fixtures/context-pruning/labeled-corpus.jsonl",
);
const defaultOut = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/evidence/context-pruning-benchmark.v1.json",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const liveApiKey = live ? resolveJevApiKey(process.env, { repoRoot }) : undefined;
if (live && !liveApiKey) {
  console.error(
    "replay-jev-context-pruning: --live requires JEV_API_KEY in env or .cursor/mcp.json tied-yaml env",
  );
  process.exit(1);
}
const fixIdx = args.indexOf("--fixtures");
const outIdx = args.indexOf("--out");
const fixturesPath = fixIdx >= 0 ? args[fixIdx + 1]! : defaultFixtures;
const outPath = outIdx >= 0 ? args[outIdx + 1]! : defaultOut;

type FixtureRow = { id: string; log: string; labels?: string[] };

function gitRev(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function aggregate(metrics: ContextLogPruneMetrics[]) {
  const sum = (fn: (m: ContextLogPruneMetrics) => number) =>
    metrics.reduce((a, m) => a + fn(m), 0);
  const n = metrics.length || 1;
  const latencies = metrics.map((m) => m.jev_latency_ms_p95).sort((a, b) => a - b);
  const p95 = latencies[Math.min(latencies.length - 1, Math.ceil(0.95 * latencies.length) - 1)] ?? 0;
  const inBytes = sum((m) => m.input_bytes);
  const outBytes = sum((m) => m.output_bytes);
  return {
    fixture_count: metrics.length,
    total_input_bytes: inBytes,
    total_output_bytes: outBytes,
    reduction_bytes: inBytes ? 1 - outBytes / inBytes : 0,
    mean_jev_latency_ms_p95: p95,
    total_jev_calls: sum((m) => m.jev_calls),
  };
}

const fixtureBody = fs.readFileSync(fixturesPath, "utf8");
const fixture_hash = crypto.createHash("sha256").update(fixtureBody).digest("hex");
const fixtures: FixtureRow[] = fixtureBody
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as FixtureRow);

const mockDecide = async (chunk: string) => {
  const fatal = /FAIL|error TS|AssertionError|panic|error:/i.test(chunk);
  const boiler = /^[\s✓✔·.]+$/m.test(chunk) && !fatal;
  return {
    fatal_noul: fatal ? 0.9 : 0.1,
    boilerplate_noul: boiler ? 0.85 : 0.2,
    jev_skipped: false,
    latency_ms: 2,
  };
};

const report: {
  schema: "context-pruning-benchmark.v1";
  meta: Record<string, unknown>;
  arms: Record<string, { per_fixture: unknown[]; aggregate: ReturnType<typeof aggregate> }>;
  paired: Record<string, unknown>;
} = {
  schema: "context-pruning-benchmark.v1",
  meta: {
    fixture_hash,
    fixture_path: fixturesPath,
    git_rev: gitRev(),
    JEV_MODEL: process.env.JEV_MODEL ?? "jev-1.13.0",
    thresholds: { passThroughLines: 30, chunkLines: 10, fatal: 0.4, boilerplate: 0.6 },
    mode: live ? "live" : "mocked",
    timestamp: new Date().toISOString(),
  },
  arms: {},
  paired: {},
};

for (const arm of ARMS) {
  const per_fixture: unknown[] = [];
  const allMetrics: ContextLogPruneMetrics[] = [];
  for (const row of fixtures) {
    const t0 = performance.now();
    const { text, metrics } = await pruneContextLog(row.log, {
      arm,
      jevConfig: live ? { apiKey: liveApiKey } : { apiKey: undefined },
      mockDecide:
        arm === "pruner_jev_on" && !live
          ? mockDecide
          : arm === "pruner_jev_on" && live
            ? undefined
            : undefined,
    });
    const elapsed_ms = performance.now() - t0;
    allMetrics.push(metrics);
    per_fixture.push({
      fixture_id: row.id,
      elapsed_ms,
      metrics,
      output_bytes: Buffer.byteLength(text, "utf8"),
    });
  }
  report.arms[arm] = { per_fixture, aggregate: aggregate(allMetrics) };
}

const raw = report.arms.raw_before!.aggregate;
const on = report.arms.pruner_jev_on!.aggregate;
const off = report.arms.pruner_jev_off!.aggregate;
report.paired = {
  raw_before_vs_pruner_jev_on: {
    reduction_bytes_raw: raw.reduction_bytes,
    reduction_bytes_on: on.reduction_bytes,
    delta_reduction: on.reduction_bytes - raw.reduction_bytes,
    p95_latency_ms_on: on.mean_jev_latency_ms_p95,
  },
  pruner_jev_on_vs_off: {
    reduction_on: on.reduction_bytes,
    reduction_off: off.reduction_bytes,
    delta_reduction: on.reduction_bytes - off.reduction_bytes,
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.error("DIAGNOSTIC: context pruning benchmark written", outPath);
console.log(JSON.stringify({ schema: report.schema, arms: Object.keys(report.arms), paired: report.paired }, null, 2));
