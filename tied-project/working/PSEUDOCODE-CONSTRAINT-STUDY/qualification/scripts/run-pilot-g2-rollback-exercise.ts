#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] P3-G — G2 verification-blocking → advisory rollback on pilot wave.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import { REPO_ROOT } from "./lib/constants.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G2_PILOT_ADVISORY,
  DEFAULT_G2_PILOT_VERIFICATION_BLOCKING,
  pilotReceiptContext,
} from "./lib/constraint-migration-receipt.ts";
import { readStddWave1, waveEntryToManifestEntry } from "./lib/pilot-wave.ts";

const ROLLBACK_RECORD = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/rollback-exercise-G2-pilots.v1.json",
);
const ROLLBACK_DIR = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/pilots/stdd/rollback-exercise",
);

async function main(): Promise<void> {
  const wave = await readStddWave1();
  await mkdir(ROLLBACK_DIR, { recursive: true });
  const entries: Array<{
    impl_token: string;
    blocking_policy: string;
    advisory_policy: string;
    blocking_gate_errors: number;
    advisory_gate_errors: number;
    unknown_disclosure_preserved: boolean;
  }> = [];

  for (const row of wave.sidecars.slice(0, 3)) {
    const entry = waveEntryToManifestEntry(row);
    const blocking = await analyzeSidecarEntry(entry, {
      gate_mode: true,
      typed_flow: true,
      constraint_flow: true,
      constraint_gate_errors: true,
      include_structural_compat: true,
    });
    const advisory = await analyzeSidecarEntry(entry, {
      gate_mode: true,
      typed_flow: true,
      constraint_flow: true,
      constraint_gate_errors: false,
      include_structural_compat: true,
    });
    const blockingReceipt = buildConstraintMigrationReceipt(
      blocking.report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      pilotReceiptContext(entry.sidecar_path, entry.token, {
        collector_notes: "G2 verification-blocking trial",
      }),
      DEFAULT_G2_PILOT_VERIFICATION_BLOCKING,
    );
    const advisoryReceipt = buildConstraintMigrationReceipt(
      advisory.report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      pilotReceiptContext(entry.sidecar_path, entry.token, {
        collector_notes: "G2 advisory restoration",
      }),
      DEFAULT_G2_PILOT_ADVISORY,
    );

    const base = row.impl_token;
    await writeFile(
      join(ROLLBACK_DIR, `${base}.blocking.receipt.json`),
      `${JSON.stringify(blockingReceipt, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      join(ROLLBACK_DIR, `${base}.advisory.receipt.json`),
      `${JSON.stringify(advisoryReceipt, null, 2)}\n`,
      "utf8",
    );

    const blockingUnknown =
      blockingReceipt.unknown_summary.unknown
      + blockingReceipt.unknown_summary.truncated
      + blockingReceipt.unknown_summary.unsupported;
    const advisoryUnknown =
      advisoryReceipt.unknown_summary.unknown
      + advisoryReceipt.unknown_summary.truncated
      + advisoryReceipt.unknown_summary.unsupported;

    entries.push({
      impl_token: row.impl_token,
      blocking_policy: blockingReceipt.layer_c.constraint_gate_errors_policy,
      advisory_policy: advisoryReceipt.layer_c.constraint_gate_errors_policy,
      blocking_gate_errors: blockingReceipt.constraint_gate_errors.length,
      advisory_gate_errors: advisoryReceipt.constraint_gate_errors.length,
      unknown_disclosure_preserved: advisoryUnknown >= blockingUnknown,
    });
  }

  const record = {
    schema_version: "rollback-exercise-G2-pilots.v1",
    exercise_at: new Date().toISOString(),
    gate_stage: "G2",
    program_gate_policy: "advisory",
    methodology_pin: "48d1fbb+",
    scope: "stdd pilot wave 1 sample (first 3 sidecars)",
    entries,
    acceptance: entries.every((e) => e.unknown_disclosure_preserved),
  };
  await writeFile(ROLLBACK_RECORD, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  console.log(`TRACE: G2 rollback exercise acceptance=${record.acceptance}`);
  if (!record.acceptance) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
