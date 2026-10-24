#!/usr/bin/env node
/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] Migrate deprecated CITDP command list keys to *_seq names.
 * Usage: node scripts/rename-citdp-command-keys.mjs [--check] [--include-trackers] [root ...]
 * Requires: npm run build --prefix mcp-server
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  migrateOrderedListKeys,
  storeMaintenanceRoots,
} from "../tools/bootstrap/lib/migrate-ordered-list-keys.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const includeTrackers = args.includes("--include-trackers");
  const roots = args.filter((a) => a !== "--check" && a !== "--include-trackers");
  const scanRoots = roots.length ? roots.map((r) => path.resolve(r)) : storeMaintenanceRoots(repoRoot);

  const result = await migrateOrderedListKeys(repoRoot, {
    storeRoot: repoRoot,
    roots: scanRoots,
    includeTrackers,
    dryRun: checkOnly,
    failIfPending: checkOnly,
    logRelativeTo: repoRoot,
  });

  if (!result.ok) {
    if (result.missing) {
      for (const m of result.missing) console.error("DIAGNOSTIC: missing", m);
    }
    if (result.hint) console.error(result.hint);
    process.exit(1);
  }

  if (checkOnly && result.changed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
