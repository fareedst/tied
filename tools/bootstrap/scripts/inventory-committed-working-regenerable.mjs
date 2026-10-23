#!/usr/bin/env node
/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
 * Read-only: git ls-files tied-project/working → migration-inventory.v1.json
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bucketCommittedWorkingPath } from "../lib/committed-working-inventory.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const requestToken = "REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE";
const inventoryPath = path.join(
  repoRoot,
  `tied-project/working/${requestToken}/evidence/migration-inventory.v1.json`,
);

const tracked = execSync("git ls-files tied-project/working", {
  cwd: repoRoot,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

const baseline_count = tracked.length;
/** @type {Record<string, string[]>} */
const buckets = { keep: [], untrack: [], relocate_fixture: [] };

/** @param {string} filePath */
function isIgnoredByGitignore(filePath) {
  try {
    execSync(`git check-ignore -q ${JSON.stringify(filePath)}`, { cwd: repoRoot, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

for (const filePath of tracked) {
  let bucket = bucketCommittedWorkingPath(filePath);
  if (bucket === "keep" && isIgnoredByGitignore(filePath)) {
    bucket = "untrack";
  }
  buckets[bucket].push(filePath);
}

for (const key of Object.keys(buckets)) {
  buckets[key].sort();
}

const inventory = {
  schema_version: "migration-inventory.v1",
  request_token: requestToken,
  baseline_tracked_count: baseline_count,
  bucket_counts: {
    keep: buckets.keep.length,
    untrack: buckets.untrack.length,
    relocate_fixture: buckets.relocate_fixture.length,
  },
  buckets,
};

fs.mkdirSync(path.dirname(inventoryPath), { recursive: true });
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.log(
  `DEBUG: inventory baseline=${baseline_count} keep=${buckets.keep.length} untrack=${buckets.untrack.length} → ${inventoryPath}`,
);
