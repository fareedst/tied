#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Phase 3 — read-only external pilot inventory scan (OD-P3-7).
 * Delegates to fleet external scan lib; writes pilots/1789177584 path for Phase 3 evidence continuity.
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildInventoryDiffV1,
  scanExternalClientSidecars,
} from "./lib/external-client-scan.ts";

const CLIENT_ID = "1789177584";
const CLIENT_ROOT = "/Users/fareed/Documents/dev/test/1789177584";
const OUT_DIR = join(REPO_ROOT, "working/fleet-constraint-v2/pilots/1789177584/dry-run");

async function main(): Promise<void> {
  try {
    await access(CLIENT_ROOT);
  } catch {
    console.error(`DIAGNOSTIC: external client root missing: ${CLIENT_ROOT}`);
    process.exit(1);
  }
  const rows = await scanExternalClientSidecars(CLIENT_ROOT);
  const diff = buildInventoryDiffV1(CLIENT_ID, CLIENT_ROOT, rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, "inventory-diff.v1.json"), `${JSON.stringify(diff, null, 2)}\n`, "utf8");
  console.log(
    `TRACE: external pilot scan sidecars=${rows.length} hash=${diff.dry_run_content_hash}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
