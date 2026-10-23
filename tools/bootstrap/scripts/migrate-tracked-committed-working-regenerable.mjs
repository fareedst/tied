#!/usr/bin/env node
/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
 * Wave untrack: git rm --cached for inventory untrack bucket; optional fixture git mv.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const requestToken = "REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE";
const inventoryPath = path.join(
  repoRoot,
  `tied-project/working/${requestToken}/evidence/migration-inventory.v1.json`,
);
const dryRun = !process.argv.includes("--apply");

if (!fs.existsSync(inventoryPath)) {
  console.error(`DIAGNOSTIC: missing inventory — run inventory-committed-working-regenerable.mjs first`);
  process.exit(1);
}

/** @type {{ buckets: { untrack: string[], relocate_fixture: string[] } }} */
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const fixtureRoot = "mcp-server/test/fixtures/committed-working";

/** @type {Array<{from:string,to?:string,action:string}>} */
const report = [];

for (const from of inventory.buckets.relocate_fixture ?? []) {
  const rel = from.replace(/^tied-project\/working\//, "");
  const to = path.join(fixtureRoot, rel);
  report.push({ from, to, action: dryRun ? "would_relocate_fixture" : "relocate_fixture" });
  if (!dryRun) {
    const destAbs = path.join(repoRoot, to);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    execSync(`git mv ${JSON.stringify(from)} ${JSON.stringify(to)}`, { cwd: repoRoot });
  }
}

for (const from of inventory.buckets.untrack ?? []) {
  report.push({ from, action: dryRun ? "would_untrack" : "untrack" });
  if (!dryRun) {
    execSync(`git rm --cached ${JSON.stringify(from)}`, { cwd: repoRoot });
  }
}

const reportPath = path.join(
  repoRoot,
  `tied-project/working/${requestToken}/evidence/migration-report.v1.json`,
);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(
  reportPath,
  `${JSON.stringify({ schema_version: "migration-report.v1", dry_run: dryRun, moves: report }, null, 2)}\n`,
  "utf8",
);
console.log(
  `DEBUG: ${dryRun ? "dry-run" : "applied"} untrack=${inventory.buckets.untrack?.length ?? 0} relocate=${inventory.buckets.relocate_fixture?.length ?? 0} report=${reportPath}`,
);
