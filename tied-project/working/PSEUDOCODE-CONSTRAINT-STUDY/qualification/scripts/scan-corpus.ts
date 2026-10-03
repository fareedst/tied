#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_TYPED_FLOW] Build/update qualification manifest from read-only corpus.
 */
import { PATHS, STDD_PROJECT_SIDECARS_ROOT } from "./lib/constants.ts";
import { scanCorpus, summarizeScan } from "./lib/corpus-scan.ts";
import {
  emptyManifest,
  recomputeStats,
  writeManifest,
} from "./lib/manifest.ts";

async function main(): Promise<void> {
  console.log("TRACE: scan-corpus starting — read-only corpus under EXTERNAL_CORPUS_ROOT");
  const entries = await scanCorpus();
  console.log(summarizeScan(entries));

  const manifest = emptyManifest(STDD_PROJECT_SIDECARS_ROOT);
  manifest.generated_at = new Date().toISOString();
  manifest.entries = entries;
  recomputeStats(manifest);

  await writeManifest(PATHS.manifest, manifest);
  console.log(`TRACE: wrote manifest → ${PATHS.manifest}`);
  console.log(
    JSON.stringify(
      {
        included: manifest.stats.included,
        excluded: manifest.stats.excluded,
        by_tier: manifest.stats.by_tier,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("DIAGNOSTIC: scan-corpus failed", err);
  process.exit(1);
});
