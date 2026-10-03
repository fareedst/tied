#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Exit non-zero when expired waivers block wave close-out.
 */
import { assertNoBlockingWaivers, loadWaiverRegistry } from "./lib/fleet-waiver-registry.ts";

async function main(): Promise<void> {
  const registry = await loadWaiverRegistry();
  const result = assertNoBlockingWaivers(registry);
  if (result.ok) {
    console.log(
      JSON.stringify({
        ok: true,
        waiver_count: registry.waivers.length,
        message: "No blocking expired waivers (empty registry passes).",
      }),
    );
    return;
  }
  console.error(
    JSON.stringify({
      ok: false,
      expired_waiver_ids: result.expired_waiver_ids,
    }),
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
