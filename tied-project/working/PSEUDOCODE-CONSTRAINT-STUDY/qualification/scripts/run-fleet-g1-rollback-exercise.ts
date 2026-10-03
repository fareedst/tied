#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] P2-G rollback exercise (OD-P2-6): simulated G2 → G1 advisory.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import {
  BASELINE_ANCHOR_COMMIT,
  METHODOLOGY_PIN_LABEL,
  REPO_ROOT,
} from "./lib/constants.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import { sidecarHasConstraintAnnotation } from "./lib/constraint-annotation-detect.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G1_OPTIONS,
} from "./lib/constraint-migration-receipt.ts";
import { readManifest, type ManifestEntry } from "./lib/manifest.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

const MAX_ENTRIES = 5;
const ROLLBACK_RECORD = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/rollback-exercise-G1.v1.json",
);
const ROLLBACK_RECEIPTS_DIR = join(CONSTRAINT_PATHS.fleetG1, "rollback-exercise");

type UnknownSummary = {
  unknown: number;
  truncated: number;
  unsupported: number;
  prose_only: number;
  budget_exceeded: number;
};

function unknownTotal(summary: UnknownSummary): number {
  return (
    summary.unknown
    + summary.truncated
    + summary.unsupported
    + summary.prose_only
    + summary.budget_exceeded
  );
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function selectRollbackEntries(): Promise<ManifestEntry[]> {
  const selected: ManifestEntry[] = [];
  try {
    const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
    for (const entry of manifest.entries) {
      if (!entry.included) continue;
      if (!(await pathExists(entry.sidecar_path))) continue;
      if (!(await sidecarHasConstraintAnnotation(entry.sidecar_path))) continue;
      selected.push(entry);
      if (selected.length >= MAX_ENTRIES) break;
    }
  } catch {
    /* manifest unavailable */
  }

  if (selected.length >= 1) return selected;

  const fallbacks = [
    {
      id: "rollback-exemplar-refinement",
      sidecar_path: join(REPO_ROOT, "working/fleet-constraint-v2/exemplars/exemplar-refinement.pseudocode.md"),
      token: "IMPL-PSEUDOCODE_CONSTRAINT_EXEMPLAR",
    },
    {
      id: "rollback-exemplar-alias-mutation",
      sidecar_path: join(
        REPO_ROOT,
        "working/fleet-constraint-v2/exemplars/exemplar-alias-mutation.pseudocode.md",
      ),
      token: "IMPL-PSEUDOCODE_CONSTRAINT_EXEMPLAR",
    },
    {
      id: "rollback-annotation-netif",
      sidecar_path: join(
        REPO_ROOT,
        "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/annotation-study/annotated/netif-cli-run.pseudocode.md",
      ),
      token: "IMPL-NETIF_CLI",
    },
  ] as ManifestEntry[];

  for (const entry of fallbacks) {
    if (!(await pathExists(entry.sidecar_path))) continue;
    selected.push(entry);
    if (selected.length >= MAX_ENTRIES) break;
  }
  return selected;
}

async function main(): Promise<void> {
  await mkdir(ROLLBACK_RECEIPTS_DIR, { recursive: true });
  const entries = await selectRollbackEntries();
  if (entries.length === 0) {
    throw new Error("rollback exercise: no eligible entries (manifest, exemplars, or annotation-study)");
  }

  const exerciseEntries: Array<Record<string, unknown>> = [];
  let allPass = true;

  for (const entry of entries) {
    const g2Analyze = await analyzeSidecarEntry(entry, {
      gate_mode: true,
      typed_flow: true,
      typed_gate_errors: true,
      constraint_flow: true,
      constraint_gate_errors: true,
      include_structural_compat: true,
    });
    const g1Analyze = await analyzeSidecarEntry(entry, { ...DEFAULT_G1_OPTIONS });

    const g2Receipt = buildConstraintMigrationReceipt(
      g2Analyze.report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      {
        manifest_entry_id: entry.id,
        sidecar_path: entry.sidecar_path,
        impl_token: entry.token,
        collector_notes: "rollback-exercise-G2-simulated",
      },
      {
        gate_mode: true,
        typed_flow: true,
        constraint_flow: true,
        constraint_gate_errors: true,
        include_structural_compat: true,
      },
      { simulated_gate: "G2-local-blocking" },
    );
    const g1Receipt = buildConstraintMigrationReceipt(
      g1Analyze.report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      {
        manifest_entry_id: entry.id,
        sidecar_path: entry.sidecar_path,
        impl_token: entry.token,
        collector_notes: "rollback-exercise-G1-restored",
      },
      DEFAULT_G1_OPTIONS,
    );

    const g2ReceiptPath = join(ROLLBACK_RECEIPTS_DIR, `${entry.id}.g2-simulated.receipt.json`);
    const g1ReceiptPath = join(ROLLBACK_RECEIPTS_DIR, `${entry.id}.g1-restored.receipt.json`);
    await writeFile(g2ReceiptPath, `${JSON.stringify(g2Receipt, null, 2)}\n`, "utf8");
    await writeFile(g1ReceiptPath, `${JSON.stringify(g1Receipt, null, 2)}\n`, "utf8");

    const g2Unknown = g2Receipt.unknown_summary;
    const g1Unknown = g1Receipt.unknown_summary;
    const g2Total = unknownTotal(g2Unknown);
    const g1Total = unknownTotal(g1Unknown);

    const assertions = {
      g1_policy_advisory: g1Receipt.layer_c.constraint_gate_errors_policy === "advisory",
      g2_policy_blocking: g2Receipt.layer_c.constraint_gate_errors_policy === "blocking",
      unknown_summary_not_silent_drop:
        g1Total >= g2Total
        || (g2Total > 0 && g1Total > 0),
      g1_receipt_has_unknown_block: g1Unknown !== undefined,
    };
    const entryPass = Object.values(assertions).every((v) => v === true);
    if (!entryPass) allPass = false;

    exerciseEntries.push({
      entry_id: entry.id,
      sidecar_path: entry.sidecar_path,
      receipts: {
        g2_simulated: g2ReceiptPath,
        g1_restored: g1ReceiptPath,
      },
      unknown_summary: { g2: g2Unknown, g1: g1Unknown },
      constraint_gate_errors_count: {
        g2: g2Receipt.constraint_gate_errors.length,
        g1: g1Receipt.constraint_gate_errors.length,
      },
      layer_c_ok: { g2: g2Receipt.layer_c.ok, g1: g1Receipt.layer_c.ok },
      assertions,
      pass: entryPass,
    });
  }

  const validation = await validateReceiptSample(
    exerciseEntries.flatMap((e) => {
      const receipts = e.receipts as { g2_simulated: string; g1_restored: string };
      return [receipts.g2_simulated, receipts.g1_restored];
    }),
  );

  const record = {
    schema_version: "rollback-exercise-G1.v1",
    run_at: new Date().toISOString(),
    methodology_pin: METHODOLOGY_PIN_LABEL,
    baseline_anchor_commit: BASELINE_ANCHOR_COMMIT,
    od_p2_6_scope: "<=5 manifest entries with constraint annotations; simulated G2 then G1 without code revert",
    entries: exerciseEntries,
    receipt_validation_sample: validation,
    pass: allPass && validation.ok,
    receipt_schema_validation_ok: validation.ok,
  };

  await writeFile(ROLLBACK_RECORD, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(record, null, 2));

  if (!record.pass) process.exit(1);
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-fleet-g1-rollback-exercise failed", err);
  process.exit(1);
});
