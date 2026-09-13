#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Phase 2 P2-F — G1 advisory sweep + constraint-migration-receipt.v1 emit.
 */
import { access } from "node:fs/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeSidecarEntry } from "./lib/analyzer-runner.ts";
import {
  BASELINE_ANCHOR_COMMIT,
  EXTERNAL_CORPUS_ROOT,
  METHODOLOGY_PIN_LABEL,
  PATHS,
  REPO_ROOT,
} from "./lib/constants.ts";
import { CONSTRAINT_PATHS } from "./lib/constraint-paths.ts";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G1_OPTIONS,
  manifestEntryToReceiptContext,
  repoRelativeSidecarPath,
} from "./lib/constraint-migration-receipt.ts";
import { readManifest, tokenFromSidecarPath, type ManifestEntry } from "./lib/manifest.ts";
import { validateReceiptSample } from "./validate-receipts-sample.ts";

type TierMetrics = {
  runnable: number;
  skipped_missing_sidecar: number;
  parse_ok: number;
  parse_ok_pct: number;
  gate_pass: number;
  new_gate_failures_vs_baseline: string[];
  zero_regression_vs_baseline: boolean;
};

type FleetG1Summary = {
  run_at: string;
  mode: "fleet-g1-qualification";
  methodology_pin: typeof METHODOLOGY_PIN_LABEL;
  baseline_anchor_commit: typeof BASELINE_ANCHOR_COMMIT;
  g1_flags: typeof DEFAULT_G1_OPTIONS;
  corpus_status: "available" | "CORPUS_UNAVAILABLE";
  corpus_root: string;
  receipts_dir: string;
  tier_a: TierMetrics;
  tier_b_stdd: TierMetrics;
  exemplar_smoke: { ran: number; parse_ok: number; receipt_paths: string[] };
  schema_validation: Awaited<ReturnType<typeof validateReceiptSample>>;
  qualification_green: "pass" | "partial" | "blocked";
  notes: string[];
};

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readBaselineOk(entryId: string): Promise<boolean | null> {
  try {
    const raw = await readFile(join(PATHS.baseline, `${entryId}.report.json`), "utf8");
    return (JSON.parse(raw) as { ok?: boolean }).ok ?? null;
  } catch {
    return null;
  }
}

function emptyTierMetrics(): TierMetrics {
  return {
    runnable: 0,
    skipped_missing_sidecar: 0,
    parse_ok: 0,
    parse_ok_pct: 0,
    gate_pass: 0,
    new_gate_failures_vs_baseline: [],
    zero_regression_vs_baseline: true,
  };
}

function finalizeTier(metrics: TierMetrics): void {
  metrics.parse_ok_pct =
    metrics.runnable > 0 ? (metrics.parse_ok / metrics.runnable) * 100 : 0;
}

async function processEntry(
  entry: ManifestEntry,
  tierMetrics: TierMetrics,
  receiptPaths: string[],
): Promise<void> {
  if (!(await pathExists(entry.sidecar_path))) {
    tierMetrics.skipped_missing_sidecar += 1;
    return;
  }
  tierMetrics.runnable += 1;

  const baselineOk = await readBaselineOk(entry.id);
  const { reportJson, report } = await analyzeSidecarEntry(entry, DEFAULT_G1_OPTIONS);

  await writeFile(
    join(CONSTRAINT_PATHS.fleetG1Reports, `${entry.id}.g1.report.json`),
    `${reportJson}\n`,
    "utf8",
  );

  if ("stage" in report && report.stage) {
    return;
  }

  tierMetrics.parse_ok += 1;
  if (report.ok === true) tierMetrics.gate_pass += 1;

  const g1Ok = report.ok === true;
  if (baselineOk === true && !g1Ok) {
    tierMetrics.new_gate_failures_vs_baseline.push(entry.id);
  }
  tierMetrics.zero_regression_vs_baseline =
    tierMetrics.new_gate_failures_vs_baseline.length === 0;

  const qualificationGreenEntry =
    tierMetrics.new_gate_failures_vs_baseline.length === 0 && g1Ok;

  const receipt = buildConstraintMigrationReceipt(
    report as Parameters<typeof buildConstraintMigrationReceipt>[0],
    {
      ...manifestEntryToReceiptContext(entry),
      promotion_readiness: {
        qualification_green: qualificationGreenEntry,
        as_of_phase: "P2-F-harness",
      },
    },
    DEFAULT_G1_OPTIONS,
  );

  const receiptPath = join(CONSTRAINT_PATHS.fleetG1Receipts, `${entry.id}.receipt.json`);
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  receiptPaths.push(receiptPath);
}

const EXEMPLAR_SMOKE: Array<{ id: string; path: string; profile: "fixture-lab" }> = [
  {
    id: "exemplar-contract-only",
    path: join(REPO_ROOT, "working/fleet-constraint-v2/exemplars/exemplar-contract-only.pseudocode.md"),
    profile: "fixture-lab",
  },
  {
    id: "exemplar-refinement",
    path: join(REPO_ROOT, "working/fleet-constraint-v2/exemplars/exemplar-refinement.pseudocode.md"),
    profile: "fixture-lab",
  },
  {
    id: "exemplar-alias-mutation",
    path: join(REPO_ROOT, "working/fleet-constraint-v2/exemplars/exemplar-alias-mutation.pseudocode.md"),
    profile: "fixture-lab",
  },
];

async function runExemplarSmoke(receiptPaths: string[]): Promise<FleetG1Summary["exemplar_smoke"]> {
  const result = { ran: 0, parse_ok: 0, receipt_paths: [] as string[] };
  for (const ex of EXEMPLAR_SMOKE) {
    if (!(await pathExists(ex.path))) continue;
    result.ran += 1;
    const pseudocode = await readFile(ex.path, "utf8");
    const token = tokenFromSidecarPath(ex.path);
    const entry: ManifestEntry = {
      id: ex.id,
      tier: "B",
      client_id: "stdd-exemplar",
      client_root: join(REPO_ROOT, "working/fleet-constraint-v2/exemplars"),
      sidecar_path: ex.path,
      token,
      input_identity: { algorithm: "sha256", hash: "", byte_length: 0 },
      lineage_tag: "primary",
      exclusion_reason: null,
      included: true,
    };
    const { reportJson, report } = await analyzeSidecarEntry(entry, DEFAULT_G1_OPTIONS);
    await writeFile(
      join(CONSTRAINT_PATHS.fleetG1Reports, `${ex.id}.g1.report.json`),
      `${reportJson}\n`,
      "utf8",
    );
    if (!("stage" in report && report.stage)) result.parse_ok += 1;

    const receipt = buildConstraintMigrationReceipt(
      report as Parameters<typeof buildConstraintMigrationReceipt>[0],
      {
        manifest_entry_id: ex.id,
        sidecar_path: repoRelativeSidecarPath(ex.path),
        impl_token: token,
        annotation_profile: ex.profile,
        layer_a_applicable: false,
        promotion_readiness: { qualification_green: false, as_of_phase: "P2-F-exemplar-smoke" },
        collector_notes: "Exemplar smoke run from run-fleet-g1-qualification.ts",
      },
      DEFAULT_G1_OPTIONS,
    );
    const receiptPath = join(CONSTRAINT_PATHS.fleetG1Receipts, `${ex.id}.receipt.json`);
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    result.receipt_paths.push(receiptPath);
    receiptPaths.push(receiptPath);
  }
  return result;
}

async function main(): Promise<void> {
  await mkdir(CONSTRAINT_PATHS.fleetG1Receipts, { recursive: true });
  await mkdir(CONSTRAINT_PATHS.fleetG1Reports, { recursive: true });

  const manifest = await readManifest(CONSTRAINT_PATHS.manifest);
  const corpusAvailable = await pathExists(EXTERNAL_CORPUS_ROOT);
  const included = manifest.entries.filter((e) => e.included);

  const tierA = emptyTierMetrics();
  const tierB = emptyTierMetrics();
  const receiptPaths: string[] = [];
  const notes: string[] = [];

  for (const entry of included) {
    if (entry.tier === "A") {
      if (!corpusAvailable) {
        tierA.skipped_missing_sidecar += 1;
        continue;
      }
      await processEntry(entry, tierA, receiptPaths);
    } else if (entry.tier === "B" && entry.client_id === "stdd") {
      await processEntry(entry, tierB, receiptPaths);
    }
  }

  finalizeTier(tierA);
  finalizeTier(tierB);

  if (!corpusAvailable) {
    notes.push(
      `CORPUS_UNAVAILABLE: external corpus missing at ${EXTERNAL_CORPUS_ROOT}; Tier A skipped; Tier B stdd + exemplars only.`,
    );
  }

  const exemplarSmoke = await runExemplarSmoke(receiptPaths);
  const schemaValidation = await validateReceiptSample(receiptPaths);

  let qualificationGreen: FleetG1Summary["qualification_green"] = "pass";
  if (!schemaValidation.ok) qualificationGreen = "blocked";
  else if (!corpusAvailable) qualificationGreen = "partial";
  else if (
    tierA.parse_ok_pct < 100 ||
    tierA.new_gate_failures_vs_baseline.length > 0 ||
    !tierB.zero_regression_vs_baseline
  ) {
    qualificationGreen = "blocked";
  }

  const summary: FleetG1Summary = {
    run_at: new Date().toISOString(),
    mode: "fleet-g1-qualification",
    methodology_pin: METHODOLOGY_PIN_LABEL,
    baseline_anchor_commit: BASELINE_ANCHOR_COMMIT,
    g1_flags: DEFAULT_G1_OPTIONS,
    corpus_status: corpusAvailable ? "available" : "CORPUS_UNAVAILABLE",
    corpus_root: EXTERNAL_CORPUS_ROOT,
    receipts_dir: CONSTRAINT_PATHS.fleetG1Receipts,
    tier_a: tierA,
    tier_b_stdd: tierB,
    exemplar_smoke: exemplarSmoke,
    schema_validation: schemaValidation,
    qualification_green: qualificationGreen,
    notes,
  };

  const summaryPath = join(CONSTRAINT_PATHS.fleetG1, "summary.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (qualificationGreen === "blocked") {
    console.error("DIAGNOSTIC: fleet-g1 qualification blocked — see summary.json");
    process.exit(1);
  }
  if (qualificationGreen === "partial") {
    console.log("TRACE: fleet-g1 partial run (CORPUS_UNAVAILABLE or reduced scope) — collector shipped");
  }
}

main().catch((err) => {
  console.error("DIAGNOSTIC: run-fleet-g1-qualification failed", err);
  process.exit(1);
});
