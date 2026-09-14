#!/usr/bin/env node
/**
 * [IMPL-FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE]
 * Fleet G4 maintenance — checks, optional unit tests, program-status refresh, receipt.
 *
 * Usage:
 *   node scripts/run-fleet-g4-maintenance.mjs [--skip-tests] [--json-out PATH]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runFleetG4Maintenance } from "./lib/fleet-g4-maintenance.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = { skipTests: false, jsonOut: "", help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--skip-tests") out.skipTests = true;
    else if (arg === "--json-out") out.jsonOut = path.resolve(argv[++i] ?? "");
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: node scripts/run-fleet-g4-maintenance.mjs [--skip-tests] [--json-out PATH]",
    );
    process.exit(0);
  }

  const maintenanceCommand = args.skipTests
    ? "node scripts/run-fleet-g4-maintenance.mjs --skip-tests"
    : "node scripts/run-fleet-g4-maintenance.mjs";

  console.log(
    `DEBUG: runFleetG4Maintenance skipTests=${args.skipTests} repo=${REPO_ROOT}`,
  );
  const result = runFleetG4Maintenance({
    repoRoot: REPO_ROOT,
    skipTests: args.skipTests,
    maintenanceCommand,
  });

  const payload = `${JSON.stringify(result.envelope, null, 2)}\n`;
  if (args.jsonOut) {
    fs.mkdirSync(path.dirname(args.jsonOut), { recursive: true });
    fs.writeFileSync(args.jsonOut, payload, "utf8");
  }
  console.log(payload.trimEnd());

  if (!result.ok) {
    process.exit(1);
  }
}

main();
