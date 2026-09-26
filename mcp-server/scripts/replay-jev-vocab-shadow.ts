#!/usr/bin/env bun
/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W2 offline replay — keyword vs Jev shadow.
 */

import fs from "node:fs";
import path from "node:path";
import {
  parseRoutingTableMarkdown,
  shadowVocabPreloadFromRows,
  summarizeShadowAgreement,
} from "../src/jev/index.js";

const repoRoot = path.resolve(import.meta.dir, "../..");
const defaultFixtures = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_DECISION_COPROCESSOR/fixtures/vocab-shadow-prompts.jsonl",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const fixIdx = args.indexOf("--fixtures");
const fixturesPath = fixIdx >= 0 ? args[fixIdx + 1]! : defaultFixtures;

const routingMd = fs.readFileSync(path.join(repoRoot, "tied/vocab/routing.md"), "utf8");
const rows = parseRoutingTableMarkdown(routingMd);
const lines = fs.readFileSync(fixturesPath, "utf8").trim().split("\n").filter(Boolean);
const prompts = lines.map((l) => JSON.parse(l) as { prompt: string });

const logs = [];
for (const { prompt } of prompts) {
  const log = await shadowVocabPreloadFromRows(prompt, rows, {
    apiKey: live ? process.env.JEV_API_KEY : undefined,
  });
  logs.push(log);
  console.log(JSON.stringify(log));
}

const summary = summarizeShadowAgreement(logs);
console.error(
  "DIAGNOSTIC: replay summary",
  JSON.stringify({ ...summary, live, fixturesPath }, null, 2),
);
if (live && summary.agreement_rate < 0.9) {
  process.exit(1);
}
