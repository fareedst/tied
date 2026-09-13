#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * CLI: validate Phase 5 FEAT-spawned checklist policy fields.
 *
 * Usage: node scripts/validate-feat-spawned-envelope-policy.mjs --checklist PATH
 */
import { validateFeatSpawnedEnvelopePolicy } from "./lib/validate-feat-spawned-envelope-policy.mjs";

function parseArgs(argv) {
  const out = { checklist: "", help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--checklist") out.checklist = argv[++i] ?? "";
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/validate-feat-spawned-envelope-policy.mjs --checklist PATH");
    process.exit(0);
  }
  if (!args.checklist) {
    console.error("ERROR: --checklist PATH is required");
    process.exit(2);
  }
  const result = validateFeatSpawnedEnvelopePolicy(args.checklist);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

main();
