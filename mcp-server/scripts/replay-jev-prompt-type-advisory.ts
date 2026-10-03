/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W3 offline replay for prompt-type advisory.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { advisePromptTypes } from "../src/jev/prompt-type-advisory.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultFixtures = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_DECISION_COPROCESSOR/fixtures/prompt-type-advisory-prompts.jsonl",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const fixIdx = args.indexOf("--fixtures");
const fixturesPath = fixIdx >= 0 ? args[fixIdx + 1]! : defaultFixtures;

const lines = fs.readFileSync(fixturesPath, "utf8").trim().split("\n").filter(Boolean);

for (const line of lines) {
  const { remainder } = JSON.parse(line) as { remainder: string };
  const log = await advisePromptTypes(remainder, {
    apiKey: live ? process.env.JEV_API_KEY : undefined,
  });
  console.log(JSON.stringify(log));
}
