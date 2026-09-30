#!/usr/bin/env bun
/**
 * [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] W3 replay — labeled fixtures × benchmark arms.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { jevDecide } from "../src/jev/client.js";
import {
  loadLabeledEvidenceFixturesFromFile,
  runChecklistEvidenceSufficiencyBenchmark,
} from "../src/jev/checklist-evidence-sufficiency-benchmark.js";
import { resolveJevApiKey } from "../src/jev/resolve-jev-api-key.js";

const repoRoot = path.resolve(import.meta.dir, "../..");
const defaultFixtures = path.join(
  repoRoot,
  "mcp-server/test/fixtures/checklist-evidence-sufficiency/labeled-corpus.v1.jsonl",
);
const defaultOut = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY/evidence/checklist-evidence-sufficiency-benchmark.v1.json",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const liveApiKey = live ? resolveJevApiKey(process.env, { repoRoot }) : undefined;
if (live && !liveApiKey) {
  console.error(
    "replay-jev-checklist-evidence-sufficiency: --live requires JEV_API_KEY in env or .cursor/mcp.json tied-yaml env",
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
const fixtures = loadLabeledEvidenceFixturesFromFile(fixturesPath);

const report = await runChecklistEvidenceSufficiencyBenchmark({
  fixtures,
  fixturePath: fixturesPath,
  fixtureBody,
  gitRev: gitRev(),
  mode: live ? "live" : "mocked",
  liveDecideFn: live ? jevDecide : undefined,
  jevConfig: live ? { apiKey: liveApiKey } : { apiKey: undefined },
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.error("DIAGNOSTIC: checklist evidence sufficiency benchmark written", outPath);
console.error(
  "DIAGNOSTIC: summary",
  JSON.stringify(
    {
      schema: report.schema,
      fixture_count: report.meta.fixture_count,
      mode: report.meta.mode,
      agreement_rate: report.agreement.jev_on_agreement_rate,
      authority_invariant_ok: report.authority_invariant_ok,
      arms: Object.keys(report.arms),
    },
    null,
    2,
  ),
);

if (
  report.agreement.jev_on_agreement_rate !== null
  && report.agreement.jev_on_agreement_rate < 0.85
  && args.includes("--enforce-agreement")
) {
  process.exit(1);
}
