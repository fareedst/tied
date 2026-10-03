/**
 * [REQ-TIED_JEV_TOOL_SAFETY_GATING] W2 replay — labeled fixtures × five benchmark arms.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { jevDecide } from "../src/jev/client.js";
import {
  loadLabeledToolSafetyFixturesFromFile,
  runToolSafetyBenchmark,
} from "../src/jev/tool-safety-benchmark.js";
import { resolveJevApiKey } from "../src/jev/resolve-jev-api-key.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultFixtures = path.join(
  repoRoot,
  "mcp-server/test/fixtures/tool-safety/labeled-corpus.v1.jsonl",
);
const defaultOut = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_TOOL_SAFETY_GATING/evidence/tool-safety-benchmark.v1.json",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const liveApiKey = live ? resolveJevApiKey(process.env, { repoRoot }) : undefined;
if (live && !liveApiKey) {
  console.error(
    "replay-jev-tool-safety-benchmark: --live requires JEV_API_KEY in env or .cursor/mcp.json tied-yaml env",
  );
  process.exit(1);
}

const fixIdx = args.indexOf("--fixtures");
const outIdx = args.indexOf("--out");
const fixturesPath = fixIdx >= 0 ? args[fixIdx + 1]! : defaultFixtures;
const outPath = outIdx >= 0 ? args[outIdx + 1]! : defaultOut;

function gitRev(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const fixtureBody = fs.readFileSync(fixturesPath, "utf8");
const fixtures = loadLabeledToolSafetyFixturesFromFile(fixturesPath);

const report = await runToolSafetyBenchmark({
  fixtures,
  fixturePath: fixturesPath,
  fixtureBody,
  gitRev: gitRev(),
  mode: live ? "live" : "mocked",
  liveDecideFn: live ? jevDecide : undefined,
  jevModel: process.env.JEV_MODEL,
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.error("DIAGNOSTIC: tool safety benchmark written", outPath);
console.error(
  "DIAGNOSTIC: summary",
  JSON.stringify(
    {
      schema: report.schema,
      fixture_hash: report.meta.fixture_hash,
      fixture_count: report.meta.fixture_count,
      mode: report.meta.mode,
      arms: Object.keys(report.arms),
    },
    null,
    2,
  ),
);
