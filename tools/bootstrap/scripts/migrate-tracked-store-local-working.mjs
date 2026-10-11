#!/usr/bin/env node
/**
 * [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
 * git mv tracked tied-bundle/working/** to mcp-server/test/fixtures/store-local-working/** and write inventory.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const fixtureRoot = path.join(repoRoot, "mcp-server/test/fixtures/store-local-working");
const inventoryPath = path.join(
  repoRoot,
  "tied-project/working/REQ-TIED_STORE_BUNDLE_GIT_POLICY/evidence/migration-inventory.v1.json",
);

const tracked = execSync("git ls-files tied-bundle/working", {
  cwd: repoRoot,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

/** @type {Array<{from:string,to:string,reason:string,consumer_refs:string[]}>} */
const moves = [];

for (const from of tracked) {
  const rel = from.replace(/^tied-bundle\/working\//, "");
  const to = path.join("mcp-server/test/fixtures/store-local-working", rel);
  const destAbs = path.join(repoRoot, to);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  execSync(`git mv ${JSON.stringify(from)} ${JSON.stringify(to)}`, { cwd: repoRoot });
  moves.push({
    from,
    to: to.split(path.sep).join("/"),
    reason: "git-tracked local working pin → fixture corpus",
    consumer_refs: [],
  });
}

const inventory = {
  schema_version: "migration-inventory.v1",
  request_token: "REQ-TIED_STORE_BUNDLE_GIT_POLICY",
  moved_count: moves.length,
  moves,
};
fs.mkdirSync(path.dirname(inventoryPath), { recursive: true });
fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.log(`DEBUG: migrated ${moves.length} paths; inventory at ${inventoryPath}`);
