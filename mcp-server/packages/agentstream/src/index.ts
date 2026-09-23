#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * TS agentstream entry — Phase 4d: TS-only; no Go forward.
 */
import {
  rejectLegacyGoImpl,
  rejectUnqualifiedTsArgv,
  resolveAgentstreamImpl,
} from "./dispatch-go.js";
import {
  checklistLoadOptionsFromConfig,
  previewLeadChecklist,
} from "./checklist-preview.js";
import {
  parseDryRunConfig,
  qualifiesForTsNativeChecklistPreview,
  qualifiesForTsNativeDryRun,
  qualifiesForTsNativeFeatureSpecPreview,
} from "./dry-run-config.js";
import { executeExecutorDryRun } from "./executor-dry-run.js";
import { previewFeatureSpecBatch } from "./featurespec-preview.js";
import { parseFeatureSpecOrderFilter } from "./featurespec-load-turns.js";
import {
  encodePreviewReport,
  previewTrackerMigration,
} from "./tracker-migration-preview.js";
import { runAdherenceReconcileCli } from "./adherence-reconcile-cli.js";
import {
  executeLiveRun,
  qualifiesForTsNativeLiveRun,
} from "./live-executor.js";
import {
  extractChecklistTrackerPreview,
  qualifiesForTsNativeAdherenceReconcile,
} from "./ts-native-args.js";

function printHelp(): void {
  console.error(`Usage: tied agentstream [agentstream options...]

Phase 4 TS-native (default TIED_AGENTSTREAM_IMPL=ts):
  --checklist-tracker-preview (with -c / --lead-checklist-yaml)
  --preview-lead-checklist (with -c; optional bounds, --checklist-var, --lead-checklist-skip-sub)
  --preview-feature-spec-batch-yaml PATH [-o ORDER]
  pipeline dry-run: -d with lead checklist (-c), feature batch (-b), -p preload, -o filter
  adherence-reconcile (subcommand) or standalone --tracker … reconcile flags
  live checklist run: -c (no preview/dry-run), including --checklist-tracker-yaml tracker mode; extended dry-run shapes (prompts-file, tdd-yaml, verify-session, --non-compact-html, argv after --)

TIED_AGENTSTREAM_IMPL=go was removed in Phase 4d (see phase4c-deprecation-notice.md).

See mcp-server/packages/agentstream/README.md for flags.
`);
}

function runChecklistTrackerPreview(args: string[]): void {
  const parsed = extractChecklistTrackerPreview(args);
  if (!parsed) {
    console.error("agentstream: internal preview parse failed");
    process.exit(2);
  }
  try {
    const report = previewTrackerMigration(
      parsed.leadChecklistYaml,
      parsed.trackerPreviewPath,
    );
    process.stdout.write(encodePreviewReport(report));
    process.exit(0);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

function runChecklistRenderPreview(args: string[]): void {
  const cwd = process.cwd();
  let cfg;
  try {
    cfg = parseDryRunConfig(cwd, args);
  } catch (err) {
    if (String(err).includes("help")) {
      printHelp();
      process.exit(0);
    }
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }
  if (!qualifiesForTsNativeChecklistPreview(cfg)) {
    rejectUnqualifiedTsArgv("checklist preview argv not TS-native");
  }
  try {
    const opts = checklistLoadOptionsFromConfig(cfg);
    process.stdout.write(previewLeadChecklist(cfg.leadChecklistYaml, opts));
    process.exit(0);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

function runFeatureSpecBatchPreview(args: string[]): void {
  const cwd = process.cwd();
  let cfg;
  try {
    cfg = parseDryRunConfig(cwd, args);
  } catch (err) {
    if (String(err).includes("help")) {
      printHelp();
      process.exit(0);
    }
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }
  if (!qualifiesForTsNativeFeatureSpecPreview(cfg)) {
    rejectUnqualifiedTsArgv("feature-spec batch preview argv not TS-native");
  }
  try {
    const opts = cfg.orderFilterRaw.trim()
      ? { orderFilter: parseFeatureSpecOrderFilter(cfg.orderFilterRaw) }
      : undefined;
    process.stdout.write(
      previewFeatureSpecBatch(cfg.previewFeatureSpecBatchYaml, opts),
    );
    process.exit(0);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

function runAdherenceReconcile(args: string[]): void {
  const cliArgs = args[0] === "adherence-reconcile" ? args.slice(1) : args;
  const result = runAdherenceReconcileCli(cliArgs);
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  process.exit(result.exitCode);
}

function runExecutorDryRun(args: string[]): void {
  const cwd = process.cwd();
  let cfg;
  try {
    cfg = parseDryRunConfig(cwd, args);
  } catch (err) {
    if (String(err).includes("help")) {
      printHelp();
      process.exit(0);
    }
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }
  if (!qualifiesForTsNativeDryRun(cfg)) {
    rejectUnqualifiedTsArgv("dry-run argv not TS-native");
  }
  try {
    const result = executeExecutorDryRun(cfg);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    process.exit(result.exitCode);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

function main(): void {
  if (resolveAgentstreamImpl() === "go") {
    rejectLegacyGoImpl();
  }

  const args = process.argv.slice(2);
  if (
    args.length === 0 ||
    args[0] === "-h" ||
    args[0] === "--help" ||
    args[0] === "help"
  ) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  try {
    const preview = extractChecklistTrackerPreview(args);
    if (preview) {
      runChecklistTrackerPreview(args);
      return;
    }
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }

  if (args.some((a) => a === "--preview-lead-checklist")) {
    runChecklistRenderPreview(args);
    return;
  }

  if (
    args.some(
      (a) =>
        a === "--preview-feature-spec-batch-yaml" ||
        a.startsWith("--preview-feature-spec-batch-yaml="),
    )
  ) {
    runFeatureSpecBatchPreview(args);
    return;
  }

  if (
    args.some((a) => a === "-d" || a === "--dry-run" || a.startsWith("--dry-run="))
  ) {
    runExecutorDryRun(args);
    return;
  }

  if (qualifiesForTsNativeAdherenceReconcile(args)) {
    runAdherenceReconcile(args);
    return;
  }

  void runLiveOrReject(args);
}

async function runLiveOrReject(args: string[]): Promise<void> {
  const cwd = process.cwd();
  let cfg;
  try {
    cfg = parseDryRunConfig(cwd, args);
  } catch (err) {
    if (String(err).includes("help")) {
      printHelp();
      process.exit(0);
    }
    console.error(`agentstream: ${String(err)}`);
    process.exit(2);
  }
  if (!qualifiesForTsNativeLiveRun(cfg)) {
    rejectUnqualifiedTsArgv("subcommand not implemented in TS");
  }
  try {
    const result = await executeLiveRun(cfg);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    process.exit(result.exitCode);
  } catch (err) {
    console.error(`agentstream: ${String(err)}`);
    process.exit(1);
  }
}

main();
