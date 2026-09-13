#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Generate W-stdd-3..10 sidecar lists (dependency-first).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildStddWavePlan,
  renderStddWaveSidecarYaml,
  stddWaveSidecarListAbsPath,
} from "./lib/stdd-wave-plan.ts";

async function main(): Promise<void> {
  const write = process.argv.includes("--write");
  const plan = await buildStddWavePlan();
  const summary = plan.waves.map((w) => ({
    wave_id: w.wave_id,
    sidecar_count: w.sidecars.length,
    first_token: w.sidecars[0]?.impl_token,
    last_token: w.sidecars[w.sidecars.length - 1]?.impl_token,
  }));
  console.log(
    JSON.stringify(
      {
        ok: true,
        excluded_count: plan.excluded_count,
        remaining_count: plan.remaining_count,
        waves: summary,
        write,
      },
      null,
      2,
    ),
  );
  if (!write) {
    console.error("TRACE: dry-run only — pass --write to emit wave-{3..10}-sidecars.yaml");
    return;
  }
  await mkdir(join(REPO_ROOT, "working/fleet-constraint-v2/waves/stdd"), {
    recursive: true,
  });
  for (const entry of plan.waves) {
    const yamlBody = renderStddWaveSidecarYaml(entry);
    const abs = stddWaveSidecarListAbsPath(entry.wave_number);
    await writeFile(abs, yamlBody, "utf8");
    console.log(`TRACE: wrote ${entry.wave_id} sidecars=${entry.sidecars.length} → ${abs}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
