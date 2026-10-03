/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W4 labeled adversarial triage pilot replay.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadLabeledTriageFixture,
  runAdversarialTriagePilot,
} from "../src/jev/adversarial-triage-pilot.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultFixture = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_DECISION_COPROCESSOR/fixtures/adversarial-triage-labeled.v1.json",
);
const defaultOut = path.join(
  repoRoot,
  "working/REQ-TIED_JEV_DECISION_COPROCESSOR/evidence/adversarial-triage-pilot-report.v1.json",
);

const args = process.argv.slice(2);
const live = args.includes("--live");
const fixIdx = args.indexOf("--fixture");
const outIdx = args.indexOf("--out");
const fixturePath = fixIdx >= 0 ? args[fixIdx + 1]! : defaultFixture;
const outPath = outIdx >= 0 ? args[outIdx + 1]! : defaultOut;

const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const cases = loadLabeledTriageFixture(raw);

const report = await runAdversarialTriagePilot(cases, {
  apiKey: live ? process.env.JEV_API_KEY : undefined,
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.error("DIAGNOSTIC: W4 pilot report written to", outPath);
console.error(
  "DIAGNOSTIC: summary",
  JSON.stringify(
    {
      jev_invoked: report.jev_invoked,
      agreement_rate: report.agreement_rate,
      live,
    },
    null,
    2,
  ),
);

if (live && report.agreement_rate !== null && report.agreement_rate < 0.9) {
  process.exit(1);
}
