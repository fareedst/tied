#!/usr/bin/env node
/**
 * [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * G4 continuous CI checks (P5-E) — see working/fleet-constraint-v2/p5-d-g4-ci-design.v1.md
 *
 * Usage: node scripts/run-fleet-g4-ci-checks.mjs [--json-out PATH]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runFleetG4CiChecks } from "./lib/fleet-g4-ci-checks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { jsonOut: "", help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json-out") out.jsonOut = path.resolve(argv[++i] ?? "");
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node scripts/run-fleet-g4-ci-checks.mjs [--json-out PATH]`);
    process.exit(0);
  }

  const report = runFleetG4CiChecks();
  const payload = `${JSON.stringify(report, null, 2)}\n`;
  if (args.jsonOut) {
    fs.mkdirSync(path.dirname(args.jsonOut), { recursive: true });
    fs.writeFileSync(args.jsonOut, payload, "utf8");
  }
  console.log(payload.trimEnd());
  if (!report.ok) {
    process.exit(1);
  }
}

main();
